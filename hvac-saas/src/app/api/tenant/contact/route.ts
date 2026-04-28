import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { startSmsSequence } from '@/lib/sms-sequence'

export async function POST(request: NextRequest) {
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

  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, website_slug')
    .eq('id', tenantId)
    .single()

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

  // Start SMS sequence if phone provided
  if (phone) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const bookingLink = tenant?.website_slug ? `${appUrl}/${tenant.website_slug}#book` : appUrl

    await startSmsSequence({
      tenantId,
      contactId: contact.id,
      contactPhone: phone,
      templateVars: {
        first_name: firstName,
        business_name: tenant?.business_name ?? 'us',
        booking_link: bookingLink,
        issue_type: 'your service request',
      },
    })
  }

  return NextResponse.json({ success: true })
}
