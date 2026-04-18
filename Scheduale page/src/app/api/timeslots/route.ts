import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateTimeSlots } from '@/lib/utils'
import { format, parseISO, getDaysInMonth } from 'date-fns'

// Seed availability: Mon–Fri 9am–5pm
const SEED_AVAILABILITY = [1, 2, 3, 4, 5].map((dow) => ({
  staff_id: 'any',
  day_of_week: dow,
  specific_date: null,
  start_time: '09:00',
  end_time: '17:00',
  is_available: true,
}))

const SEED_DURATIONS: Record<string, number> = {
  'seed-svc-1': 45,
  'seed-svc-2': 90,
  'seed-svc-3': 30,
}

const supabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

/**
 * GET /api/timeslots
 *
 * Mode 1 — Specific date:
 *   ?staffId=X&date=YYYY-MM-DD&serviceId=Y
 *   Returns { slots: TimeSlot[] }
 *
 * Mode 2 — Month availability dots:
 *   ?staffId=X&month=YYYY-MM
 *   Returns { dates: { date: string, hasSlots: boolean }[] }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get('staffId')
  const date = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')
  const month = searchParams.get('month')

  if (!staffId) return NextResponse.json({ error: 'staffId required' }, { status: 400 })

  // ── Seed mode (no Supabase configured) ─────────────────────────────────────
  if (!supabaseConfigured()) {
    if (month) {
      const monthStart = parseISO(`${month}-01`)
      const daysInMonth = getDaysInMonth(monthStart)
      const dates = []
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(monthStart.getFullYear(), monthStart.getMonth(), d)
        const dateStr = format(dateObj, 'yyyy-MM-dd')
        const dow = dateObj.getDay()
        dates.push({ date: dateStr, hasSlots: dow >= 1 && dow <= 5 })
      }
      return NextResponse.json({ dates })
    }
    if (date) {
      const dow = parseISO(date).getDay()
      if (dow === 0 || dow === 6) return NextResponse.json({ slots: [] })
      const duration = serviceId ? (SEED_DURATIONS[serviceId] ?? 45) : 45
      const slots = generateTimeSlots('09:00', '17:00', duration, [])
      return NextResponse.json({ slots })
    }
  }

  const admin = createAdminClient()

  // ── Mode 2: Month availability ──────────────────────────────────────────────
  if (month) {
    const monthStart = parseISO(`${month}-01`)
    const daysInMonth = getDaysInMonth(monthStart)

    const { data: avail } = await admin
      .from('availability')
      .select('day_of_week, specific_date, start_time, end_time, is_available')
      .eq('staff_id', staffId)

    const dates = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(monthStart.getFullYear(), monthStart.getMonth(), d)
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const dayOfWeek = dateObj.getDay()

      const specificOverride = avail?.find((a) => a.specific_date === dateStr)
      const recurringRule = avail?.find((a) => a.day_of_week === dayOfWeek && !a.specific_date)
      const rule = specificOverride ?? recurringRule
      dates.push({ date: dateStr, hasSlots: !!rule && rule.is_available })
    }

    return NextResponse.json({ dates })
  }

  // ── Mode 1: Slots for a specific date ───────────────────────────────────────
  if (!date) return NextResponse.json({ error: 'date or month required' }, { status: 400 })

  const dateObj = parseISO(date)
  const dayOfWeek = dateObj.getDay()

  const { data: avail } = await admin
    .from('availability')
    .select('*')
    .eq('staff_id', staffId)

  const specificOverride = avail?.find((a) => a.specific_date === date)
  const recurringRule = avail?.find((a) => a.day_of_week === dayOfWeek && !a.specific_date)
  const rule = specificOverride ?? recurringRule

  if (!rule || !rule.is_available) return NextResponse.json({ slots: [] })

  const { data: bookings } = await admin
    .from('bookings')
    .select('booking_time')
    .eq('staff_id', staffId)
    .eq('booking_date', date)
    .neq('status', 'cancelled')

  const bookedTimes = (bookings ?? []).map((b) => b.booking_time)

  let durationMinutes = 30
  if (serviceId) {
    const { data: service } = await admin
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single()
    if (service) durationMinutes = service.duration_minutes
  }

  const slots = generateTimeSlots(
    rule.start_time.substring(0, 5),
    rule.end_time.substring(0, 5),
    durationMinutes,
    bookedTimes
  )

  return NextResponse.json({ slots })
}
