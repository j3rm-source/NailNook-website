import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { CalendarCheck, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Bookings' }

const STATUS_STYLES = {
  upcoming:   { label: 'Upcoming',   cls: 'badge-blue' },
  completed:  { label: 'Completed',  cls: 'badge-green' },
  cancelled:  { label: 'Cancelled',  cls: 'badge-gray' },
}

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, contact:contacts(first_name, last_name, phone, issue_type)')
    .eq('tenant_id', profile!.tenant_id)
    .order('starts_at', { ascending: false })

  const upcoming = bookings?.filter(b => b.status === 'upcoming') ?? []
  const past = bookings?.filter(b => b.status !== 'upcoming') ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-700 text-white">Bookings</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      {!bookings?.length && (
        <div className="card text-center py-16">
          <CalendarCheck size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-500">No bookings yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Bookings from Cal.com and your website will appear here.
          </p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-600 uppercase tracking-widest text-slate-500 mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.map((b) => <BookingRow key={b.id} booking={b} />)}
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

function BookingRow({ booking }: { booking: any }) {
  const status = STATUS_STYLES[booking.status as keyof typeof STATUS_STYLES]
  const contactName = booking.contact
    ? `${booking.contact.first_name} ${booking.contact.last_name ?? ''}`.trim()
    : 'Unknown'

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

      <div className="flex items-center gap-3 shrink-0">
        <span className={cn('badge', status.cls)}>{status.label}</span>
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
