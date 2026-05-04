'use client'

import { Booking } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { format, startOfWeek, endOfWeek } from 'date-fns'

interface StatsCardsProps {
  bookings: Booking[]
}

export function StatsCards({ bookings }: StatsCardsProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const active = bookings.filter((b) => b.status !== 'cancelled')

  const todayBookings = active.filter((b) => b.booking_date === today)
  const weekBookings = active.filter(
    (b) => b.booking_date >= weekStart && b.booking_date <= weekEnd
  )
  const weekRevenue = weekBookings.reduce((sum, b) => sum + (b.service?.price ?? 0), 0)
  const totalRevenue = active.reduce((sum, b) => sum + (b.service?.price ?? 0), 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Today's Bookings"
        value={String(todayBookings.length)}
        sub={`${todayBookings.filter((b) => b.status === 'confirmed').length} confirmed`}
        color="text-accent"
      />
      <StatCard
        label="This Week"
        value={String(weekBookings.length)}
        sub="confirmed bookings"
        color="text-blue-600"
      />
      <StatCard
        label="Week Revenue"
        value={formatPrice(weekRevenue)}
        sub="from confirmed bookings"
        color="text-green-600"
      />
      <StatCard
        label="Total Revenue"
        value={formatPrice(totalRevenue)}
        sub="all time"
        color="text-purple-600"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
