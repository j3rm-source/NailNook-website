import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { startSmsSequence } from '@/lib/sms-sequence'
import { sendNewLeadEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { ok, retryAfterMs } = rateLimit(`contact:${ip}`, 5, 60_000)
  if (!ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  const { tenantId, firstName, phone, email, message } = await request.json() as {
    tenantId: string
    firstName: string
    phone?: string
    email?: string
    message?: string
  }

  if (!tenantId || !firstName) {
    return NextResponse.json({ error: 'tenantId and firstName required' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Verify tenant exists and has an active subscription before creating contact or firing SMS
  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, website_slug, stripe_subscription_status')
    .eq('id', tenantId)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (tenant.stripe_subscription_status !== 'active') {
    return NextResponse.json({ error: 'Account inactive' }, { status: 403 })
  }

  // Create contact
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      tenant_id: tenantId,
      first_name: firstName,
      phone: phone || null,
      email: email || null,
      source: 'website_form',
      status: 'new',
      notes: message || null,
    })
    .select('id')
    .single()

  if (error || !contact) {
    console.error('Failed to create contact from website form:', error)
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 })
  }

  // Create job
  await supabase.from('jobs').insert({
    tenant_id: tenantId,
    contact_id: contact.id,
    title: `Website inquiry from ${firstName}`,
    status: 'new',
    description: message || null,
  })

  // Fetch owner email for notification (parallel with SMS setup)
  const [smsResult, { data: ownerProfile }] = await Promise.all([
    phone
      ? startSmsSequence({
          tenantId,
          contactId: contact.id,
          contactPhone: phone,
          templateVars: {
            first_name: firstName,
            business_name: tenant.business_name,
            booking_link: tenant.website_slug
              ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${tenant.website_slug}#book`
              : process.env.NEXT_PUBLIC_APP_URL ?? '',
            issue_type: 'your service request',
          },
        })
      : Promise.resolve([]),
    supabase.from('user_profiles').select('email').eq('tenant_id', tenantId).eq('role', 'owner').single(),
  ])
  void smsResult

  if (ownerProfile?.email) {
    await sendNewLeadEmail({
      to: ownerProfile.email,
      businessName: tenant.business_name,
      contactName: firstName,
      phone: phone ?? null,
      source: 'website_form',
      issueType: message ?? null,
    })
  }

  return NextResponse.json({ success: true })
}
