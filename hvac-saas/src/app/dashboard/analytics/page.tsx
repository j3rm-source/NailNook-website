import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPlanFeatures } from '@/lib/types'
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import AnalyticsCharts from './_components/analytics-charts'
import { subDays, startOfDay, format } from 'date-fns'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: tenant } = await supabase
    .from('tenants').select('plan_tier').eq('id', profile!.tenant_id).single()

  const features = getPlanFeatures((tenant?.plan_tier ?? 1) as 1 | 2 | 3)

  if (!features.hasAnalytics) {
    return (
      <div className="card text-center py-20 animate-fade-in">
        <BarChart3 size={36} className="text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg font-600 text-slate-300 mb-2">Analytics requires Pro Plan</h2>
        <p className="text-slate-500 text-sm mb-6">Upgrade to Pro to access detailed analytics and lead tracking.</p>
        <Link href="/dashboard/settings/billing" className="btn-primary flex items-center gap-2 mx-auto w-fit">
          Upgrade to Pro <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  const tenantId = profile!.tenant_id
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30)).toISOString()

  // Fetch all analytics data
  const [
    { data: contacts },
    { data: jobs },
    { data: sequences },
  ] = await Promise.all([
    supabase.from('contacts').select('created_at, source, status').eq('tenant_id', tenantId).gte('created_at', thirtyDaysAgo),
    supabase.from('jobs').select('status, quoted_amount, invoice_amount, created_at').eq('tenant_id', tenantId),
    supabase.from('sms_sequences').select('status, created_at').eq('tenant_id', tenantId),
  ])

  // Leads over time (last 30 days bucketed by day)
  const leadsOverTime = buildLeadsOverTime(contacts ?? [])

  // Leads by source
  const leadsBySource = buildLeadsBySource(contacts ?? [])

  // Booking conversion rate
  const totalLeads = contacts?.length ?? 0
  const booked = contacts?.filter(c => c.status === 'booked' || c.status === 'won').length ?? 0
  const conversionRate = totalLeads > 0 ? Math.round((booked / totalLeads) * 100) : 0

  // Pipeline revenue (quoted)
  const pipelineRevenue = jobs
    ?.filter(j => j.status !== 'completed' && j.status !== 'cancelled' && j.quoted_amount)
    .reduce((sum, j) => sum + (j.quoted_amount ?? 0), 0) ?? 0

  // Revenue collected (completed jobs with invoice)
  const collectedRevenue = jobs
    ?.filter(j => j.status === 'completed' && j.invoice_amount)
    .reduce((sum, j) => sum + (j.invoice_amount ?? 0), 0) ?? 0

  // SMS stats
  const totalSequences = sequences?.length ?? 0
  const completedSequences = sequences?.filter(s => s.status === 'completed').length ?? 0
  const smsCompletionRate = totalSequences > 0 ? Math.round((completedSequences / totalSequences) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <TrendingUp size={22} className="text-blue-400" />
        <div>
          <h1 className="text-2xl font-700 text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Last 30 days</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={totalLeads.toString()} sub="last 30 days" color="blue" />
        <StatCard label="Booking Rate" value={`${conversionRate}%`} sub={`${booked} booked`} color="green" />
        <StatCard label="Pipeline Value" value={`$${(pipelineRevenue / 100).toLocaleString()}`} sub="open jobs" color="orange" />
        <StatCard label="Revenue Collected" value={`$${(collectedRevenue / 100).toLocaleString()}`} sub="completed jobs" color="purple" />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        leadsOverTime={leadsOverTime}
        leadsBySource={leadsBySource}
        smsCompletionRate={smsCompletionRate}
        totalSequences={totalSequences}
      />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors = {
    blue:   'text-blue-400 bg-blue-500/10',
    green:  'text-green-400 bg-green-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  }
  return (
    <div className="card">
      <p className="text-xs font-600 uppercase tracking-wide text-slate-500 mb-2">{label}</p>
      <p className={`text-2xl font-700 ${colors[color as keyof typeof colors].split(' ')[0]}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-1">{sub}</p>
    </div>
  )
}

// ── Data helpers ───────────────────────────────────────────────────────────────

function buildLeadsOverTime(contacts: { created_at: string }[]) {
  const days: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'MMM d')
    days[d] = 0
  }
  for (const c of contacts) {
    const d = format(new Date(c.created_at), 'MMM d')
    if (d in days) days[d]++
  }
  return Object.entries(days).map(([date, count]) => ({ date, count }))
}

function buildLeadsBySource(contacts: { source: string }[]) {
  const map: Record<string, number> = {}
  for (const c of contacts) {
    map[c.source] = (map[c.source] ?? 0) + 1
  }
  const SOURCE_LABELS: Record<string, string> = {
    website_form: 'Website',
    ai_call: 'AI Call',
    sms_reply: 'SMS',
    manual: 'Manual',
    cal_booking: 'Cal.com',
  }
  return Object.entries(map).map(([source, value]) => ({
    name: SOURCE_LABELS[source] ?? source,
    value,
  }))
}
