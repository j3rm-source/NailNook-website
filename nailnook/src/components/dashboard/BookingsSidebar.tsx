'use client'

import { useEffect, useState } from 'react'
import { Booking } from '@/lib/types'
import { formatDateShort, formatTime, formatPrice, cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

interface BookingsSidebarProps {
  staffId: string
}

export function BookingsSidebar({ staffId }: BookingsSidebarProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/bookings?staffId=${staffId}&status=confirmed`)
      .then((r) => r.json())
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [staffId])

  const upcoming = bookings
    .filter((b) => b.booking_date >= new Date().toISOString().split('T')[0])
    .slice(0, 20)

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No upcoming bookings</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg bg-gray-50 p-3 border border-gray-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                  <p className="text-xs text-gray-500">
                    {booking.service?.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-gray-700">
                    {formatDateShort(booking.booking_date)}
                  </p>
                  <p className="text-xs text-accent font-medium">
                    {formatTime(booking.booking_time)}
                  </p>
                </div>
              </div>
              {booking.service && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatPrice(booking.service.price)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
