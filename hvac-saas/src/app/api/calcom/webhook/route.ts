import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cancelSmsSequence } from '@/lib/sms-sequence'

export async function POST(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })

  const body = await request.json()
  const { triggerEvent, payload } = body

  const supabase = await createAdminClient()

  if (triggerEvent === 'BOOKING_CREATED') {
    const attendee = payload?.attendees?.[0]
    const phone = attendee?.phoneNumber ?? null
    const email = attendee?.email ?? null
    const name = attendee?.name ?? 'Unknown'
    const [firstName, ...rest] = name.split(' ')
    const lastName = rest.join(' ') || null

    // Find or create contact
    let contactId: string | null = null
    if (email || phone) {
      const query = supabase.from('contacts').select('id')
        .eq('tenant_id', tenantId)
      if (email) query.eq('email', email)
      const { data: existing } = await query.single()

      if (existing) {
        contactId = existing.id
      } else {
        const { data: newContact } = await supabase.from('contacts').insert({
          tenant_id: tenantId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          source: 'cal_booking',
          status: 'booked',
        }).select('id').single()
        contactId = newContact?.id ?? null
      }
    }

    // Create booking record
    const { data: booking } = await supabase.from('bookings').insert({
      tenant_id: tenantId,
      contact_id: contactId!,
      calcom_booking_id: String(payload?.bookingId ?? ''),
      starts_at: payload?.startTime,
      ends_at: payload?.endTime,
      status: 'upcoming',
    }).select('id').single()

    // Create linked job
    if (contactId) {
      await supabase.from('jobs').insert({
        tenant_id: tenantId,
        contact_id: contactId,
        title: payload?.title ?? 'Booked appointment',
        status: 'scheduled',
        scheduled_at: payload?.startTime,
      })

      // Cancel any pending SMS sequences
      await cancelSmsSequence(contactId)

      // Update contact status
      await supabase.from('contacts').update({ status: 'booked' }).eq('id', contactId)
    }
  }

  if (triggerEvent === 'BOOKING_CANCELLED') {
    const calcomId = String(payload?.bookingId ?? '')
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('calcom_booking_id', calcomId)
  }

  return NextResponse.json({ received: true })
}
