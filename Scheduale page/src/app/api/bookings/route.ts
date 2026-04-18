import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import {
  sendSMS,
  buildBookingConfirmationStaffSMS,
  buildBookingConfirmationCustomerSMS,
} from '@/lib/twilio'
import { formatDateLong, formatTime } from '@/lib/utils'

const supabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// GET /api/bookings — admin: all bookings; ?staffId=X for staff view
export async function GET(request: NextRequest) {
  if (!supabaseConfigured()) return NextResponse.json([])
  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get('staffId')
  const status = searchParams.get('status')

  const admin = createAdminClient()
  let query = admin
    .from('bookings')
    .select(`
      *,
      staff:staff_id (id, name, color, phone),
      service:service_id (id, name, price, duration_minutes)
    `)
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })

  if (staffId) query = query.eq('staff_id', staffId)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/bookings — create a booking and fire SMS
export async function POST(request: NextRequest) {
  if (!supabaseConfigured()) {
    // Demo mode — return a fake confirmed booking
    const body = await request.json()
    return NextResponse.json({
      id: `demo-${Date.now()}`,
      staff_id: body.staffId,
      service_id: body.serviceId,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      booking_date: body.bookingDate,
      booking_time: body.bookingTime,
      status: 'confirmed',
      staff: { id: body.staffId, name: 'Sarah Johnson', phone: null },
      service: { id: body.serviceId, name: 'Haircut', price: 45, duration_minutes: 45 },
    }, { status: 201 })
  }

  try {
    const body = await request.json()
    const {
      staffId,
      serviceId,
      customerName,
      customerPhone,
      customerEmail,
      customerNote,
      bookingDate,
      bookingTime,
    } = body

    if (!staffId || !serviceId || !customerName || !customerPhone || !bookingDate || !bookingTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Check slot is still available
    const { data: existing } = await admin
      .from('bookings')
      .select('id')
      .eq('staff_id', staffId)
      .eq('booking_date', bookingDate)
      .eq('booking_time', bookingTime)
      .neq('status', 'cancelled')
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
    }

    // Create booking
    const { data: booking, error } = await admin
      .from('bookings')
      .insert({
        staff_id: staffId,
        service_id: serviceId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        customer_note: customerNote || null,
        booking_date: bookingDate,
        booking_time: bookingTime,
        status: 'confirmed',
      })
      .select(`
        *,
        staff:staff_id (id, name, phone),
        service:service_id (id, name, price, duration_minutes)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fire SMS notifications (non-blocking)
    const dateFormatted = formatDateLong(bookingDate)
    const timeFormatted = formatTime(bookingTime)

    if (booking.staff?.phone) {
      sendSMS(
        booking.staff.phone,
        buildBookingConfirmationStaffSMS(customerName, booking.service.name, dateFormatted, timeFormatted)
      ).catch(console.error)
    }

    sendSMS(
      customerPhone,
      buildBookingConfirmationCustomerSMS(
        customerName,
        booking.service.name,
        booking.staff.name,
        dateFormatted,
        timeFormatted
      )
    ).catch(console.error)

    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
