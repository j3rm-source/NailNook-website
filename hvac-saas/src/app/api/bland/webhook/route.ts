import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'
import { startSmsSequence } from '@/lib/sms-sequence'
import { sendNewLeadEmail } from '@/lib/email'

function verifyBlandAuth(authHeader: string | null): boolean {
  const secret = process.env.BLAND_WEBHOOK_SECRET ?? process.env.BLAND_AI_API_KEY
  if (!secret) return false
  const expected = `Bearer ${secret}`
  if (!authHeader || authHeader.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  } catch {
    return false
  }
}

const anthropic = new Anthropic()

async function parseTranscript(transcript: string): Promise<{ name: string; issue: string; booked: boolean; score: number }> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Extract from this AI receptionist call transcript. Reply with valid JSON only, no explanation or markdown.

Transcript:
${transcript}

{
  "name": "caller first name or empty string if unclear",
  "issue": "service need description (e.g. AC repair, furnace issue, water heater replacement, drain clog, plumbing leak) or empty string",
  "booked": true or false based on whether an appointment was scheduled,
  "score": integer 1-10 lead qualification score. Award points: +2 gave their name, +3 described a specific service issue, +2 agreed to receive booking link, +2 gave address or zip code, +1 gave phone number. A caller who gave all info and has a clear urgent need = 10.
}`,
    }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const clean = text.replace(/```(?:json)?\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(clean)
  // Clamp score to 1–10
  parsed.score = Math.min(10, Math.max(1, Math.round(Number(parsed.score ?? 5))))
  return parsed
}

export async function POST(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })

  if (!verifyBlandAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { call_id, status, transcript, concatenated_transcript, metadata } = body

  if (status !== 'completed') return NextResponse.json({ received: true })

  const supabase = await createAdminClient()
  const callerPhone = metadata?.caller_phone ?? ''
  const rawTranscript = concatenated_transcript ?? transcript ?? ''

  // Parse name/issue/booking outcome via Claude
  let firstName = ''
  let issueType = ''
  let booked = false
  let leadScore: number | null = null
  try {
    const parsed = await parseTranscript(rawTranscript)
    firstName = parsed.name
    issueType = parsed.issue
    booked = parsed.booked
    leadScore = parsed.score
  } catch {
    booked = rawTranscript.toLowerCase().includes('booked') ||
      rawTranscript.toLowerCase().includes('appointment')
  }

  // Create or find contact
  let contactId: string | null = null
  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('phone', callerPhone)
    .maybeSingle()

  if (existing) {
    contactId = existing.id
    if (leadScore !== null) {
      await supabase.from('contacts').update({ lead_score: leadScore }).eq('id', contactId)
    }
  } else if (callerPhone) {
    const { data: newContact } = await supabase
      .from('contacts')
      .insert({
        tenant_id: tenantId,
        first_name: firstName || 'Unknown',
        phone: callerPhone,
        source: 'ai_call',
        status: 'new',
        issue_type: issueType || null,
        lead_score: leadScore,
      })
      .select('id')
      .single()
    contactId = newContact?.id ?? null
  }

  // Create job
  if (contactId) {
    await supabase.from('jobs').insert({
      tenant_id: tenantId,
      contact_id: contactId,
      title: issueType ? `${issueType} (from AI call)` : 'New job from AI call',
      status: 'new',
    })
  }

  const outcome = booked ? 'booked' : 'follow_up_sent'

  // Save AI call record
  await supabase.from('ai_calls').insert({
    tenant_id: tenantId,
    contact_id: contactId,
    caller_phone: callerPhone,
    outcome,
    transcript: rawTranscript || null,
    bland_call_id: call_id,
  })

  // Fetch tenant + owner email for SMS and notifications
  const [{ data: tenant }, { data: ownerProfile }] = await Promise.all([
    supabase.from('tenants').select('business_name, twilio_number').eq('id', tenantId).single(),
    supabase.from('user_profiles').select('email').eq('tenant_id', tenantId).eq('role', 'owner').single(),
  ])

  // Fire SMS sequence if not booked
  if (!booked && contactId && callerPhone && tenant) {
    await startSmsSequence({
      tenantId,
      contactId,
      contactPhone: callerPhone,
      templateVars: {
        first_name: firstName || 'there',
        business_name: tenant.business_name,
        booking_link: `${process.env.NEXT_PUBLIC_APP_URL}/book/${tenantId}`,
        issue_type: issueType || 'your service request',
      },
    })
  }

  // Notify tenant owner of new lead
  if (ownerProfile?.email && contactId && !existing) {
    await sendNewLeadEmail({
      to: ownerProfile.email,
      businessName: tenant?.business_name ?? 'your business',
      contactName: firstName || callerPhone,
      phone: callerPhone || null,
      source: 'ai_call',
      issueType: issueType || null,
    })
  }

  return NextResponse.json({ received: true })
}
