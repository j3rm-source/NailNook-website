import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { startSmsSequence } from '@/lib/sms-sequence'

export async function POST(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })

  const body = await request.json()
  const { call_id, status, transcript, concatenated_transcript, metadata } = body

  if (status !== 'completed') return NextResponse.json({ received: true })

  const supabase = await createAdminClient()
  const callerPhone = metadata?.caller_phone ?? ''

  // Parse name/issue from transcript (simple heuristic — upgrade with AI later)
  const firstName = extractName(concatenated_transcript ?? transcript ?? '')
  const issueType = extractIssue(concatenated_transcript ?? transcript ?? '')

  // Create or find contact
  let contactId: string | null = null
  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('phone', callerPhone)
    .single()

  if (existing) {
    contactId = existing.id
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

  // Determine outcome
  const booked = (concatenated_transcript ?? '').toLowerCase().includes('booked') ||
    (concatenated_transcript ?? '').toLowerCase().includes('appointment')
  const outcome = booked ? 'booked' : 'follow_up_sent'

  // Save AI call record
  await supabase.from('ai_calls').insert({
    tenant_id: tenantId,
    contact_id: contactId,
    caller_phone: callerPhone,
    outcome,
    transcript: concatenated_transcript ?? transcript ?? null,
    bland_call_id: call_id,
  })

  // Fire SMS sequence if not booked
  if (!booked && contactId && callerPhone) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('business_name, twilio_number')
      .eq('id', tenantId)
      .single()

    await startSmsSequence({
      tenantId,
      contactId,
      contactPhone: callerPhone,
      templateVars: {
        first_name: firstName || 'there',
        business_name: tenant?.business_name ?? 'us',
        booking_link: `${process.env.NEXT_PUBLIC_APP_URL}/book/${tenantId}`,
        issue_type: issueType || 'your service request',
      },
    })
  }

  return NextResponse.json({ received: true })
}

function extractName(transcript: string): string {
  const match = transcript.match(/my name is ([A-Z][a-z]+)/i) ||
    transcript.match(/I'm ([A-Z][a-z]+)/i) ||
    transcript.match(/this is ([A-Z][a-z]+)/i)
  return match?.[1] ?? ''
}

function extractIssue(transcript: string): string {
  const issues = ['AC', 'air conditioning', 'furnace', 'heating', 'plumbing', 'water heater', 'drain', 'pipe', 'leak', 'HVAC']
  for (const issue of issues) {
    if (transcript.toLowerCase().includes(issue.toLowerCase())) return issue
  }
  return ''
}
