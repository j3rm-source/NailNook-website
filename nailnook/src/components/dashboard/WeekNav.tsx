'use client'

import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns'
import { Button } from '@/components/ui/Button'

interface WeekNavProps {
  weekStart: Date
  onPrev: () => void
  onNext: () => void
  onCopyToNextWeek: () => void
}

export function WeekNav({ weekStart, onPrev, onNext, onCopyToNextWeek }: WeekNavProps) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Previous week"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-gray-900 text-sm">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
        </span>
        <button
          onClick={onNext}
          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Next week"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <Button variant="secondary" size="sm" onClick={onCopyToNextWeek}>
        Copy to next week
      </Button>
    </div>
  )
}
