import { createClient } from '@/lib/supabase/server'
import { Users, Briefcase, CalendarCheck, TrendingUp, Phone, MessageSquare } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function getDashboardStats(tenantId: string) {
  const supabase = await createClient()

  const [contacts, jobs, bookings, aiCalls] = await Promise.all([
    supabase.from('contacts').select('id, status, created_at').eq('tenant_id', tenantId),
    supabase.from('jobs').select('id, status, quoted_amount, invoice_amount').eq('tenant_id', tenantId),
    supabase.from('bookings').select('id, status').eq('tenant_id', tenantId),
    supabase.from('ai_calls').select('id, outcome').eq('tenant_id', tenantId),
  ])

  const totalContacts = contacts.data?.length ?? 0
  const newLeads = contacts.data?.filter(c => c.status === 'new').length ?? 0
  const totalJobs = jobs.data?.length ?? 0
  const completedJobs = jobs.data?.filter(j => j.status === 'completed').length ?? 0
  const pipelineValue = jobs.data?.reduce((sum, j) => sum + (j.quoted_amount ?? 0), 0) ?? 0
  const totalBookings = bookings.data?.length ?? 0
  const totalCalls = aiCalls.data?.length ?? 0
  const bookedFromCalls = aiCalls.data?.filter(c => c.outcome === 'booked').length ?? 0

  return {
    totalContacts, newLeads, totalJobs, completedJobs,
    pipelineValue, totalBookings, totalCalls, bookedFromCalls,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id, full_name')
    .eq('id', user!.id)
    .single()

  if (!profile) redirect('/signup/plan')

  const stats = await getDashboardStats(profile.tenant_id)
  const firstName = profile.full_name?.split(' ')[0] ?? 'there'

  const statCards = [
    {
      label: 'Total Contacts',
      value: stats.totalContacts,
      sub: `${stats.newLeads} new leads`,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Jobs in Pipeline',
      value: stats.totalJobs,
      sub: `${stats.completedJobs} completed`,
      icon: Briefcase,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(stats.pipelineValue),
      sub: 'Quoted amount',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Bookings',
      value: stats.totalBookings,
      sub: 'Total booked',
      icon: CalendarCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'AI Calls',
      value: stats.totalCalls,
      sub: `${stats.bookedFromCalls} converted to booking`,
      icon: Phone,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'SMS Sent',
      value: '—',
      sub: 'Connect SMS to track',
      icon: MessageSquare,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-700 text-white">Good morning, {firstName} 👋</h1>
        <p className="text-slate-400 mt-1 text-sm">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-slate-500 font-500 uppercase tracking-wide">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={15} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-700 text-white">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-sm font-600 text-slate-300 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/dashboard/contacts?add=true" className="btn-primary text-xs">
            <Users size={14} /> Add Contact
          </a>
          <a href="/dashboard/jobs?add=true" className="btn-secondary text-xs">
            <Briefcase size={14} /> Create Job
          </a>
          <a href="/dashboard/bookings" className="btn-secondary text-xs">
            <CalendarCheck size={14} /> View Bookings
          </a>
          <a href="/dashboard/settings/billing" className="btn-ghost text-xs">
            Manage Billing →
          </a>
        </div>
      </div>
    </div>
  )
}
