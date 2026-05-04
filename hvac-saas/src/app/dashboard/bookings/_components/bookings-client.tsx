'use client'

import { useState } from 'react'
import { CalendarCheck, Clock, ExternalLink, XCircle, UserX } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  upcoming:   { label: 'Upcoming',  cls: 'badge-blue' },
  completed:  { label: 'Completed', cls: 'badge-green' },
  cancelled:  { label: 'Cancelled', cls: 'badge-gray' },
  no_show:    { label: 'No-show',   cls: 'badge-gray' },
}

interface Booking {
  id: string
  status: string
  starts_at: string
  calcom_booking_id: string | null
  contact: { first_name: string; last_name: string | null; phone: string | null; issue_type: string | null } | null
}

interface Props {
  upcoming: Booking[]
  past: Booking[]
}

export default function BookingsClient({ upcoming: initialUpcoming, past: initialPast }: Props) {
  const [upcoming, setUpcoming] = useState(initialUpcoming)
  const [past, setPast] = useState(initialPast)
  const [loading, setLoading] = useState<Record<string, string>>({})

  async function updateStatus(bookingId: string, status: 'cancelled' | 'no_show') {
    setLoading(prev => ({ ...prev, [bookingId]: status }))
    const res = await fetch('/api/bookings/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status }),
    })
    if (res.ok) {
      setUpcoming(prev => {
        const moved = prev.find(b => b.id === bookingId)
        if (moved) setPast(past => [{ ...moved, status }, ...past])
        return prev.filter(b => b.id !== bookingId)
      })
    }
    setLoading(prev => {
      const next = { ...prev }
      delete next[bookingId]
      return next
    })
  }

  if (!upcoming.length && !past.length) {
    return (
      <div className="card text-center py-16">
        <CalendarCheck size={32} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-500">No bookings yet</p>
        <p className="text-slate-600 text-sm mt-1">
          Bookings from Cal.com and your website will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-600 uppercase tracking-widest text-slate-500 mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                loadingAction={loading[b.id]}
                onCancel={() => updateStatus(b.id, 'cancelled')}
                onNoShow={() => updateStatus(b.id, 'no_show')}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-600 uppercase tracking-widest text-slate-500 mb-3">Past</h2>
          <div className="space-y-2">
            {past.map((b) => <BookingRow key={b.id} booking={b} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function BookingRow({
  booking,
  loadingAction,
  onCancel,
  onNoShow,
}: {
  booking: Booking
  loadingAction?: string
  onCancel?: () => void
  onNoShow?: () => void
}) {
  const status = STATUS_STYLES[booking.status as keyof typeof STATUS_STYLES]
  const contactName = booking.contact
    ? `${booking.contact.first_name} ${booking.contact.last_name ?? ''}`.trim()
    : 'Unknown'
  const isUpcoming = booking.status === 'upcoming'

  return (
    <div className="card flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
        <CalendarCheck size={17} className="text-blue-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-500 text-slate-200">{contactName}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={11} /> {formatDateTime(booking.starts_at)}
          </span>
          {booking.contact?.issue_type && (
            <span className="text-xs text-slate-600">{booking.contact.issue_type}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={cn('badge', status?.cls ?? 'badge-gray')}>{status?.label ?? booking.status}</span>

        {isUpcoming && onCancel && onNoShow && (
          <>
            <button
              onClick={onNoShow}
              disabled={!!loadingAction}
              title="Mark as no-show"
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-colors disabled:opacity-40"
            >
              <UserX size={14} />
            </button>
            <button
              onClick={onCancel}
              disabled={!!loadingAction}
              title="Cancel booking"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
            >
              <XCircle size={14} />
            </button>
          </>
        )}

        {booking.calcom_booking_id && (
          <a
            href={`https://cal.com/booking/${booking.calcom_booking_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="View in Cal.com"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  )
}
