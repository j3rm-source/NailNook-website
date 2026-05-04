import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatPhone } from '@/lib/utils'
import { Phone, CalendarCheck, Users, Briefcase, ArrowDownLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Activity' }

type EventKind = 'call' | 'booking' | 'contact' | 'job'

interface FeedEvent {
  id: string
  kind: EventKind
  title: string
  sub: string
  at: string
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const tid = profile!.tenant_id

  const [{ data: calls }, { data: bookings }, { data: contacts }, { data: jobs }] = await Promise.all([
    supabase
      .from('ai_calls')
      .select('id, created_at, outcome, caller_phone, contact:contacts(first_name, last_name)')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('bookings')
      .select('id, created_at, starts_at, status, contact:contacts(first_name, last_name)')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('contacts')
      .select('id, created_at, first_name, last_name, source')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('jobs')
      .select('id, created_at, title, status, contact:contacts(first_name, last_name)')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const SOURCE_LABELS: Record<string, string> = {
    website_form: 'Website form',
    ai_call: 'AI call',
    sms_reply: 'SMS reply',
    cal_booking: 'Booking',
    manual: 'Manual entry',
  }

  const OUTCOME_LABELS: Record<string, string> = {
    booked: 'Booked appointment',
    follow_up_sent: 'Follow-up SMS sent',
    no_answer: 'No answer',
    other: 'Call completed',
  }

  const events: FeedEvent[] = [
    ...(calls ?? []).map(c => {
      const contact = (Array.isArray(c.contact) ? c.contact[0] : c.contact) as { first_name: string; last_name: string | null } | null
      const name = contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : formatPhone(c.caller_phone)
      return {
        id: `call-${c.id}`,
        kind: 'call' as EventKind,
        title: `AI call — ${name}`,
        sub: OUTCOME_LABELS[c.outcome] ?? c.outcome,
        at: c.created_at,
      }
    }),
    ...(bookings ?? []).map(b => {
      const contact = (Array.isArray(b.contact) ? b.contact[0] : b.contact) as { first_name: string; last_name: string | null } | null
      const name = contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : 'Unknown'
      return {
        id: `booking-${b.id}`,
        kind: 'booking' as EventKind,
        title: `Booking — ${name}`,
        sub: `${b.status} · ${formatDateTime(b.starts_at)}`,
        at: b.created_at,
      }
    }),
    ...(contacts ?? []).map(c => ({
      id: `contact-${c.id}`,
      kind: 'contact' as EventKind,
      title: `New contact — ${c.first_name} ${c.last_name ?? ''}`.trim(),
      sub: SOURCE_LABELS[c.source] ?? c.source,
      at: c.created_at,
    })),
    ...(jobs ?? []).map(j => {
      const contact = (Array.isArray(j.contact) ? j.contact[0] : j.contact) as { first_name: string; last_name: string | null } | null
      const name = contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : ''
      return {
        id: `job-${j.id}`,
        kind: 'job' as EventKind,
        title: j.title,
        sub: `${j.status.replace('_', ' ')}${name ? ` · ${name}` : ''}`,
        at: j.created_at,
      }
    }),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 60)

  const KIND_CONFIG: Record<EventKind, { icon: React.ElementType; bg: string; color: string }> = {
    call:    { icon: Phone,         bg: 'bg-blue-500/15',   color: 'text-blue-400' },
    booking: { icon: CalendarCheck, bg: 'bg-green-500/15',  color: 'text-green-400' },
    contact: { icon: Users,         bg: 'bg-orange-500/15', color: 'text-orange-400' },
    job:     { icon: Briefcase,     bg: 'bg-purple-500/15', color: 'text-purple-400' },
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-700 text-white">Activity Feed</h1>
        <p className="text-slate-400 text-sm mt-0.5">Recent calls, contacts, bookings, and jobs across your account.</p>
      </div>

      {events.length === 0 && (
        <div className="card text-center py-16">
          <ArrowDownLeft size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-500">No activity yet</p>
          <p className="text-slate-600 text-sm mt-1">Events will appear here as leads come in.</p>
        </div>
      )}

      <div className="relative">
        {/* Vertical line */}
        {events.length > 0 && (
          <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-800" />
        )}

        <div className="space-y-1">
          {events.map((event) => {
            const cfg = KIND_CONFIG[event.kind]
            const Icon = cfg.icon
            return (
              <div key={event.id} className="flex items-start gap-4 py-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 relative z-10`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-500 text-slate-200">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{event.sub}</p>
                </div>
                <span className="text-xs text-slate-600 pt-1 shrink-0">{formatDateTime(event.at)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
