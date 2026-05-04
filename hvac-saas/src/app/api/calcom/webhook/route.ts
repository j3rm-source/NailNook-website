import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cancelSmsSequence } from '@/lib/sms-sequence'
import { createHmac, timingSafeEqual } from 'crypto'
import { sendBookingConfirmationEmail } from '@/lib/email'

async function parseAndVerify(request: NextRequest): Promise<{ ok: boolean; body: any }> {
  const rawBody = await request.text()
  const secret = process.env.CALCOM_WEBHOOK_SECRET

  // Reject outright when secret is not configured — don't silently allow all traffic
  if (!secret) {
    console.error('CALCOM_WEBHOOK_SECRET is not set — rejecting webhook')
    return { ok: false, body: null }
  }

  const signature = request.headers.get('X-Cal-Signature-256') ?? ''
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  const match = sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf)
  if (!match) return { ok: false, body: null }

  try {
    return { ok: true, body: JSON.parse(rawBody) }
  } catch {
    return { ok: false, body: null }
  }
}

export async function POST(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })

  const { ok, body } = await parseAndVerify(request)
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })

  const { triggerEvent, payload } = body
  const supabase = await createAdminClient()

  if (triggerEvent === 'BOOKING_CREATED') {
    const attendee = payload?.attendees?.[0]
    const phone = attendee?.phoneNumber ?? null
    const email = attendee?.email ?? null
    const name = attendee?.name ?? 'Unknown'
    const [firstName, ...rest] = name.split(' ')
    const lastName = rest.join(' ') || null

    let contactId: string | null = null
    let existingId: string | null = null

    if (email) {
      const { data } = await supabase
        .from('contacts').select('id')
        .eq('tenant_id', tenantId)
        .eq('email', email)
        .maybeSingle()
      existingId = data?.id ?? null
    }

    if (!existingId && phone) {
      const { data } = await supabase
        .from('contacts').select('id')
        .eq('tenant_id', tenantId)
        .eq('phone', phone)
        .maybeSingle()
      existingId = data?.id ?? null
    }

    if (existingId) {
      contactId = existingId
      await supabase.from('contacts').update({ status: 'booked' }).eq('id', contactId)
    } else if (email || phone) {
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

    if (contactId) {
      await supabase.from('bookings').insert({
        tenant_id: tenantId,
        contact_id: contactId,
        calcom_booking_id: String(payload?.bookingId ?? ''),
        starts_at: payload?.startTime,
        ends_at: payload?.endTime,
        status: 'upcoming',
      })

      await supabase.from('jobs').insert({
        tenant_id: tenantId,
        contact_id: contactId,
        title: payload?.title ?? 'Booked appointment',
        status: 'scheduled',
        scheduled_at: payload?.startTime,
      })

      await cancelSmsSequence(contactId)

      // Notify tenant owner of new booking
      const [{ data: ownerProfile }, { data: tenant }] = await Promise.all([
        supabase.from('user_profiles').select('email').eq('tenant_id', tenantId).eq('role', 'owner').single(),
        supabase.from('tenants').select('business_name').eq('id', tenantId).single(),
      ])
      if (ownerProfile?.email) {
        await sendBookingConfirmationEmail({
          to: ownerProfile.email,
          businessName: tenant?.business_name ?? 'your business',
          contactName: `${firstName}${lastName ? ' ' + lastName : ''}`,
          startsAt: payload?.startTime,
          jobTitle: payload?.title ?? 'Booked appointment',
        })
      }
    }
  }

  if (triggerEvent === 'BOOKING_CANCELLED') {
    const calcomId = String(payload?.bookingId ?? '')
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('calcom_booking_id', calcomId)
      .eq('tenant_id', tenantId)
  }

  return NextResponse.json({ received: true })
}
