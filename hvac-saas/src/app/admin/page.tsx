import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { Users, TrendingUp, CreditCard, Activity, AlertTriangle } from 'lucide-react'
import AdminClientsTable from './_components/admin-clients-table'
import AdminBroadcast from './_components/admin-broadcast'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — J2 Systems' }

const PLAN_MRR: Record<number, number> = { 1: 197, 2: 497, 3: 997 }
const PLAN_NAMES: Record<number, string> = { 1: 'Foundation', 2: 'Growth System', 3: 'Revenue Partner' }
const PLAN_COLORS: Record<number, string> = {
  1: 'bg-blue-500/15 text-blue-300',
  2: 'bg-orange-500/15 text-orange-300',
  3: 'bg-purple-500/15 text-purple-300',
}


export default async function AdminPage() {
  const supabase = await createAdminClient()

  const [
    { data: tenants },
    { data: contactCounts },
    { data: jobCounts },
    { data: recentContacts },
    { data: recentJobs },
    { data: recentCalls },
  ] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, business_name, plan_tier, stripe_subscription_status, created_at, website_slug')
      .order('created_at', { ascending: false }),
    supabase.from('contacts').select('tenant_id'),
    supabase.from('jobs').select('tenant_id'),
    supabase.from('contacts').select('tenant_id, created_at').order('created_at', { ascending: false }),
    supabase.from('jobs').select('tenant_id, created_at').order('created_at', { ascending: false }),
    supabase.from('ai_calls').select('tenant_id, created_at').order('created_at', { ascending: false }),
  ])

  const allTenants = tenants ?? []
  const active = allTenants.filter(t => t.stripe_subscription_status === 'active')
  const mrr = active.reduce((sum, t) => sum + (PLAN_MRR[t.plan_tier] ?? 0), 0)

  const contactsByTenant = (contactCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.tenant_id] = (acc[r.tenant_id] ?? 0) + 1
    return acc
  }, {})

  const jobsByTenant = (jobCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.tenant_id] = (acc[r.tenant_id] ?? 0) + 1
    return acc
  }, {})

  // Last-activity per tenant: max created_at across contacts, jobs, ai_calls
  const lastActivityByTenant: Record<string, string> = {}
  for (const row of [...(recentContacts ?? []), ...(recentJobs ?? []), ...(recentCalls ?? [])]) {
    const prev = lastActivityByTenant[row.tenant_id]
    if (!prev || row.created_at > prev) lastActivityByTenant[row.tenant_id] = row.created_at
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const atRisk = active.filter(t => {
    const last = lastActivityByTenant[t.id] ?? t.created_at
    return last < thirtyDaysAgo
  })

  const planBreakdown = [1, 2, 3].map(tier => ({
    tier,
    count: active.filter(t => t.plan_tier === tier).length,
    mrr: active.filter(t => t.plan_tier === tier).length * (PLAN_MRR[tier] ?? 0),
  }))

  const stats = [
    { label: 'Total Clients', value: allTenants.length, sub: `${active.length} active`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'MRR', value: `$${mrr.toLocaleString()}`, sub: 'Active subscriptions', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'ARR', value: `$${(mrr * 12).toLocaleString()}`, sub: 'Annualised', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Avg Plan', value: active.length ? `$${Math.round(mrr / active.length)}/mo` : '—', sub: 'Per active client', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-700 text-white">Operator Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">All clients · internal view only</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-5" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-slate-500 font-500 uppercase tracking-wide">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-700 text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <h2 className="text-sm font-600 text-slate-300 mb-4">Plan Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {planBreakdown.map(p => (
            <div key={p.tier} className="rounded-xl p-4" style={{ backgroundColor: '#111', border: '1px solid #1a1a1a' }}>
              <span className={`text-xs px-2 py-0.5 rounded-full font-500 ${PLAN_COLORS[p.tier]}`}>
                {PLAN_NAMES[p.tier]}
              </span>
              <p className="text-2xl font-700 text-white mt-3">{p.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">${p.mrr.toLocaleString()}/mo</p>
            </div>
          ))}
        </div>
      </div>

      {/* At-risk clients */}
      {atRisk.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#0d0d0d', border: '1px solid #2a1a1a' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-red-400" />
            <h2 className="text-sm font-600 text-red-300">At-Risk Clients ({atRisk.length})</h2>
            <span className="text-xs text-slate-600 ml-1">— no activity in 30+ days</span>
          </div>
          <div className="space-y-2">
            {atRisk.map(t => {
              const last = lastActivityByTenant[t.id] ?? t.created_at
              return (
                <div key={t.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ backgroundColor: '#111', border: '1px solid #2a1a1a' }}>
                  <div>
                    <p className="text-sm font-500 text-slate-200">{t.business_name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{PLAN_NAMES[t.plan_tier]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-400">Last active</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(last)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <AdminBroadcast />

      <AdminClientsTable
        tenants={allTenants}
        contactsByTenant={contactsByTenant}
        jobsByTenant={jobsByTenant}
      />
    </div>
  )
}
