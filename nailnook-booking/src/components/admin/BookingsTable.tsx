'use client'

import { useState } from 'react'
import { Booking } from '@/lib/types'
import { formatDateShort, formatTime, formatPrice, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface BookingsTableProps {
  bookings: Booking[]
  onCancel: (id: string) => Promise<void>
}

export function BookingsTable({ bookings, onCancel }: BookingsTableProps) {
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all')

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking and notify the customer?')) return
    setCancelling(id)
    await onCancel(id)
    setCancelling(null)
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'confirmed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize',
              filter === f
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">
          {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Customer</th>
                <th className="text-left p-3 font-medium text-gray-500">Service</th>
                <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Staff</th>
                <th className="text-left p-3 font-medium text-gray-500">Date & Time</th>
                <th className="text-left p-3 font-medium text-gray-500 hidden sm:table-cell">Price</th>
                <th className="text-left p-3 font-medium text-gray-500">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="p-3">
                      <p className="font-medium text-gray-900">{booking.customer_name}</p>
                      <p className="text-xs text-gray-400">{booking.customer_phone}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-700">{booking.service?.name ?? '—'}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {booking.staff && (
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: booking.staff.color }}
                          />
                        )}
                        <span className="text-gray-700">{booking.staff?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-700">{formatDateShort(booking.booking_date)}</p>
                      <p className="text-xs text-gray-400">{formatTime(booking.booking_time)}</p>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className="text-gray-700">
                        {booking.service ? formatPrice(booking.service.price) : '—'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-700'
                        )}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {booking.status !== 'cancelled' && (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={cancelling === booking.id}
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
