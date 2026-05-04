'use client'

import { useState, useEffect } from 'react'
import { formatDateLong, formatTime, cn } from '@/lib/utils'
import { TimeSlotSkeleton } from '@/components/ui/Skeleton'

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotsStepProps {
  staffId: string | null
  serviceId: string
  selectedDate: string
  selectedTime: string | null
  onSelect: (time: string) => void
}

export function TimeSlotsStep({
  staffId,
  serviceId,
  selectedDate,
  selectedTime,
  onSelect,
}: TimeSlotsStepProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate || !serviceId) return
    setLoading(true)

    const sid = staffId ?? 'any'
    fetch(`/api/timeslots?staffId=${sid}&date=${selectedDate}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [staffId, serviceId, selectedDate])

  return (
    <div className="animate-slide-in">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose a Time</h2>
      <p className="text-sm text-gray-500 mb-6">{formatDateLong(selectedDate)}</p>

      {loading ? (
        <TimeSlotSkeleton />
      ) : slots.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-4xl mb-3">😔</p>
          <p className="font-medium">No available slots for this date</p>
          <p className="text-sm mt-1">Please go back and pick another day</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map(({ time, available }) => (
            <button
              key={time}
              onClick={() => available && onSelect(time)}
              disabled={!available}
              className={cn(
                'rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
                selectedTime === time && available
                  ? 'bg-accent text-white shadow-md'
                  : available
                  ? 'bg-white border border-gray-200 text-gray-700 hover:border-accent hover:text-accent hover:shadow-sm'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
              )}
            >
              {formatTime(time)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
