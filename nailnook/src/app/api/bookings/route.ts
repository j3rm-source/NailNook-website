import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase'
import {
  sendSMS,
  buildBookingConfirmationStaffSMS,
  buildBookingConfirmationCustomerSMS,
} from '@/lib/twilio'
import { formatDateLong, formatTime } from '@/lib/utils'
import { sendOwnerBookingEmail } from '@/lib/resend'

// GET /api/bookings — admin: all bookings; ?staffId=X for staff view
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([])
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

// When staffId is 'any', pick a random available staff member for the requested date/time
async function resolveAnyStaff(
  admin: ReturnType<typeof createAdminClient>,
  bookingDate: string,
  bookingTime: string
): Promise<string | null> {
  const dayOfWeek = new Date(bookingDate + 'T12:00:00').getDay()

  const { data: staffList } = await admin
    .from('staff')
    .select('id')
    .eq('role', 'staff')

  if (!staffList || staffList.length === 0) return null

  // Shuffle for fairness
  const shuffled = [...staffList].sort(() => Math.random() - 0.5)

  for (const s of shuffled) {
    const { data: avail } = await admin
      .from('availability')
      .select('*')
      .eq('staff_id', s.id)

    const specific = avail?.find((a) => a.specific_date === bookingDate)
    const recurring = avail?.find((a) => a.day_of_week === dayOfWeek && !a.specific_date)
    const rule = specific ?? recurring

    if (!rule || !rule.is_available) continue

    const startTime = rule.start_time.substring(0, 5)
    const endTime = rule.end_time.substring(0, 5)
    if (bookingTime < startTime || bookingTime >= endTime) continue

    // Check this slot isn't already booked
    const { data: existing } = await admin
      .from('bookings')
      .select('id')
      .eq('staff_id', s.id)
      .eq('booking_date', bookingDate)
      .eq('booking_time', bookingTime)
      .neq('status', 'cancelled')
      .maybeSingle()

    if (!existing) return s.id
  }

  return null
}

// POST /api/bookings — create a booking and fire SMS
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
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

    const normalizedPhone = customerPhone.replace(/\D/g, '').replace(/^1?(\d{10})$/, '+1$1')
    const admin = createAdminClient()

    // Resolve 'any' to a real staff member
    let resolvedStaffId = staffId
    if (staffId === 'any') {
      const picked = await resolveAnyStaff(admin, bookingDate, bookingTime)
      if (!picked) {
        return NextResponse.json({ error: 'No staff available at this time' }, { status: 409 })
      }
      resolvedStaffId = picked
    }

    // Check slot is still available
    const { data: existing } = await admin
      .from('bookings')
      .select('id')
      .eq('staff_id', resolvedStaffId)
      .eq('booking_date', bookingDate)
      .eq('booking_time', bookingTime)
      .neq('status', 'cancelled')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
    }

    const { data: booking, error } = await admin
      .from('bookings')
      .insert({
        staff_id: resolvedStaffId,
        service_id: serviceId,
        customer_name: customerName,
        customer_phone: normalizedPhone,
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

    // Fire SMS notifications (non-blocking, swallow errors so booking always succeeds)
    const dateFormatted = formatDateLong(bookingDate)
    const timeFormatted = formatTime(bookingTime)
    const serviceName = booking.service?.name ?? 'your service'
    const staffName = booking.staff?.name ?? 'your specialist'

    if (booking.staff?.phone) {
      sendSMS(
        booking.staff.phone,
        buildBookingConfirmationStaffSMS(customerName, serviceName, dateFormatted, timeFormatted)
      ).catch(console.error)
    }

    sendSMS(
      normalizedPhone,
      buildBookingConfirmationCustomerSMS(customerName, serviceName, staffName, dateFormatted, timeFormatted)
    ).catch(console.error)

    sendOwnerBookingEmail({
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      staffName,
      date: dateFormatted,
      time: timeFormatted,
      note: customerNote,
    }).catch(console.error)

    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
