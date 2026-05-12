import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase'
import { generateTimeSlots } from '@/lib/utils'
import { format, parseISO, getDaysInMonth } from 'date-fns'

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
 *
 * staffId may be 'any' to aggregate across all active staff.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')
    const month = searchParams.get('month')

    if (!staffId) return NextResponse.json({ error: 'staffId required' }, { status: 400 })

    // ── Seed mode ──────────────────────────────────────────────────────────────
    if (!isSupabaseConfigured()) {
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
      return NextResponse.json({ error: 'date or month required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // ── Mode 2: Month availability ──────────────────────────────────────────────
    if (month) {
      const monthStart = parseISO(`${month}-01`)
      const daysInMonth = getDaysInMonth(monthStart)

      if (staffId === 'any') {
        // Aggregate across all staff — date is available if ANY staff member has slots
        const { data: allStaff } = await admin.from('staff').select('id').eq('role', 'staff')
        const staffIds = (allStaff ?? []).map((s: { id: string }) => s.id)

        const { data: allAvail } = staffIds.length > 0
          ? await admin
              .from('availability')
              .select('staff_id, day_of_week, specific_date, is_available')
              .in('staff_id', staffIds)
          : { data: [] }

        const dates = []
        for (let d = 1; d <= daysInMonth; d++) {
          const dateObj = new Date(monthStart.getFullYear(), monthStart.getMonth(), d)
          const dateStr = format(dateObj, 'yyyy-MM-dd')
          const dayOfWeek = dateObj.getDay()

          const hasAny = staffIds.some((sid: string) => {
            const sa = (allAvail ?? []).filter((a: { staff_id: string }) => a.staff_id === sid)
            const specific = sa.find((a: { specific_date: string | null }) => a.specific_date === dateStr)
            const recurring = sa.find((a: { day_of_week: number | null; specific_date: string | null }) => a.day_of_week === dayOfWeek && !a.specific_date)
            const rule = specific ?? recurring
            return rule && (rule as { is_available: boolean }).is_available
          })

          dates.push({ date: dateStr, hasSlots: hasAny })
        }
        return NextResponse.json({ dates })
      }

      // Single staff month view
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

    // Resolve service duration
    let durationMinutes = 30
    if (serviceId) {
      const { data: service } = await admin
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single()
      if (service) durationMinutes = service.duration_minutes
    }

    if (staffId === 'any') {
      // Union available slots across all active staff
      const { data: allStaff } = await admin.from('staff').select('id').eq('role', 'staff')
      const staffIds = (allStaff ?? []).map((s: { id: string }) => s.id)

      if (staffIds.length === 0) return NextResponse.json({ slots: [] })

      const { data: allAvail } = await admin
        .from('availability')
        .select('*')
        .in('staff_id', staffIds)

      const { data: allBookings } = await admin
        .from('bookings')
        .select('staff_id, booking_time')
        .in('staff_id', staffIds)
        .eq('booking_date', date)
        .neq('status', 'cancelled')

      // A time is available if at least one staff member can take it
      const slotMap = new Map<string, boolean>()

      for (const sid of staffIds) {
        const sa = (allAvail ?? []).filter((a: { staff_id: string }) => a.staff_id === sid)
        const specific = sa.find((a: { specific_date: string | null }) => a.specific_date === date)
        const recurring = sa.find((a: { day_of_week: number | null; specific_date: string | null }) => a.day_of_week === dayOfWeek && !a.specific_date)
        const rule = specific ?? recurring

        if (!rule || !(rule as { is_available: boolean }).is_available) continue

        const bookedTimes = (allBookings ?? [])
          .filter((b: { staff_id: string }) => b.staff_id === sid)
          .map((b: { booking_time: string }) => b.booking_time)

        const staffSlots = generateTimeSlots(
          (rule as { start_time: string }).start_time.substring(0, 5),
          (rule as { end_time: string }).end_time.substring(0, 5),
          durationMinutes,
          bookedTimes
        )

        for (const slot of staffSlots) {
          if (slot.available) slotMap.set(slot.time, true)
          else if (!slotMap.has(slot.time)) slotMap.set(slot.time, false)
        }
      }

      const slots = Array.from(slotMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([time, available]) => ({ time, available }))

      return NextResponse.json({ slots })
    }

    // Single staff specific date
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

    const slots = generateTimeSlots(
      rule.start_time.substring(0, 5),
      rule.end_time.substring(0, 5),
      durationMinutes,
      bookedTimes
    )

    return NextResponse.json({ slots })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
