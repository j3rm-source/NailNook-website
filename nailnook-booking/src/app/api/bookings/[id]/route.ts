import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import {
  sendSMS,
  buildCancellationCustomerSMS,
  buildCancellationStaffSMS,
} from '@/lib/twilio'
import { formatDateLong, formatTime } from '@/lib/utils'

// PUT /api/bookings/[id] — update status (mainly cancellation)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

    const admin = createAdminClient()

    const { data: booking, error } = await admin
      .from('bookings')
      .update({ status })
      .eq('id', params.id)
      .select(`
        *,
        staff:staff_id (id, name, phone),
        service:service_id (id, name)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fire cancellation SMS
    if (status === 'cancelled') {
      const dateFormatted = formatDateLong(booking.booking_date)
      const timeFormatted = formatTime(booking.booking_time)
      const businessUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'our website'

      sendSMS(
        booking.customer_phone,
        buildCancellationCustomerSMS(dateFormatted, timeFormatted, businessUrl)
      ).catch(console.error)

      if (booking.staff?.phone) {
        sendSMS(
          booking.staff.phone,
          buildCancellationStaffSMS(booking.customer_name, dateFormatted, timeFormatted)
        ).catch(console.error)
      }
    }

    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
