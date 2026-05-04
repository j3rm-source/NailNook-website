import { format, parse, addMinutes, isBefore, isEqual, parseISO } from 'date-fns'

// Format "2024-07-15" → "Monday, July 15, 2024"
export function formatDateLong(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy')
}

// Format "2024-07-15" → "Jul 15"
export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

// Format "09:00:00" or "09:00" → "9:00 AM"
export function formatTime(timeStr: string): string {
  const normalized = timeStr.length === 5 ? timeStr + ':00' : timeStr
  const d = parse(normalized, 'HH:mm:ss', new Date())
  return format(d, 'h:mm a')
}

// Format price number → "$45.00"
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

// Format duration in minutes → "45 min" or "1 hr 30 min"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

/**
 * Generate available time slots for a given day.
 * @param startTime "09:00"
 * @param endTime "17:00"
 * @param durationMinutes service duration
 * @param bookedTimes already-booked start times e.g. ["10:00", "14:30"]
 * @returns array of slot strings e.g. ["09:00", "09:45", ...]
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  bookedTimes: string[] = []
): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = []
  const baseDate = new Date(2000, 0, 1)

  const start = parse(startTime, 'HH:mm', baseDate)
  const end = parse(endTime, 'HH:mm', baseDate)

  let current = start
  while (isBefore(current, end) || isEqual(current, end)) {
    const slotEnd = addMinutes(current, durationMinutes)
    if (isBefore(slotEnd, end) || isEqual(slotEnd, end)) {
      const timeStr = format(current, 'HH:mm')
      const isBooked = bookedTimes.some((bt) => {
        const booked = parse(bt.substring(0, 5), 'HH:mm', baseDate)
        return isEqual(booked, current)
      })
      slots.push({ time: timeStr, available: !isBooked })
    }
    current = addMinutes(current, 30) // always step 30min for granularity
  }

  return slots
}

// Day of week name from index (0=Sunday)
export function getDayName(dayIndex: number): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]
}

// Generate 30-min time labels from 06:00 to 22:00
export function generateDayTimeLabels(): string[] {
  const labels: string[] = []
  const base = new Date(2000, 0, 1, 6, 0)
  for (let i = 0; i <= 32; i++) {
    labels.push(format(addMinutes(base, i * 30), 'HH:mm'))
  }
  return labels
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
