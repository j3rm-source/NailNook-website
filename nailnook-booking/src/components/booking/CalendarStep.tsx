'use client'

import { useState, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  startOfDay,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

interface CalendarStepProps {
  staffId: string | null
  selectedDate: string | null
  onSelect: (date: string) => void
}

interface AvailableDate {
  date: string
  hasSlots: boolean
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarStep({ staffId, selectedDate, onSelect }: CalendarStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const month = format(currentMonth, 'yyyy-MM')
    setLoading(true)

    const url = staffId
      ? `/api/timeslots?staffId=${staffId}&month=${month}`
      : `/api/timeslots?staffId=any&month=${month}`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setAvailableDates(data.dates ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentMonth, staffId])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const today = startOfDay(new Date())

  // Leading blanks to align the first day
  const leadingBlanks = getDay(monthStart)

  function getDateInfo(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd')
    const isPast = isBefore(day, today)
    const info = availableDates.find((d) => d.date === dateStr)
    return { dateStr, isPast, hasSlots: info?.hasSlots ?? false }
  }

  return (
    <div className="animate-slide-in">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose a Date</h2>
      <p className="text-sm text-gray-500 mb-6">
        Green dots indicate available slots
      </p>

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Leading blanks */}
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {days.map((day) => {
              const { dateStr, isPast, hasSlots } = getDateInfo(day)
              const isSelected = selectedDate === dateStr
              const isDisabled = isPast || !hasSlots

              return (
                <button
                  key={dateStr}
                  onClick={() => !isDisabled && onSelect(dateStr)}
                  disabled={isDisabled}
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg h-10 text-sm font-medium transition-all duration-200',
                    isSelected && 'bg-accent text-white shadow-md',
                    !isSelected && !isDisabled && 'hover:bg-accent/10 text-gray-900 cursor-pointer',
                    isDisabled && 'text-gray-300 cursor-not-allowed'
                  )}
                >
                  {format(day, 'd')}
                  {hasSlots && !isSelected && !isPast && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-green-500" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
