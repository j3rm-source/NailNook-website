'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const PLAN_NAMES: Record<number, string> = { 1: 'Foundation', 2: 'Growth System', 3: 'Revenue Partner' }
const PLAN_COLORS: Record<number, string> = {
  1: 'bg-blue-500/15 text-blue-300',
  2: 'bg-orange-500/15 text-orange-300',
  3: 'bg-purple-500/15 text-purple-300',
}

type SortKey = 'business_name' | 'plan_tier' | 'contacts' | 'jobs' | 'created_at'
type SortDir = 'asc' | 'desc'

interface Tenant {
  id: string
  business_name: string
  plan_tier: number
  stripe_subscription_status: string | null
  created_at: string
  website_slug: string | null
}

interface Props {
  tenants: Tenant[]
  contactsByTenant: Record<string, number>
  jobsByTenant: Record<string, number>
}

export default function AdminClientsTable({ tenants, contactsByTenant, jobsByTenant }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = q
      ? tenants.filter(t => t.business_name.toLowerCase().includes(q) || (t.website_slug ?? '').includes(q))
      : [...tenants]

    list.sort((a, b) => {
      let av: string | number, bv: string | number
      if (sortKey === 'business_name') { av = a.business_name; bv = b.business_name }
      else if (sortKey === 'plan_tier')  { av = a.plan_tier;    bv = b.plan_tier }
      else if (sortKey === 'contacts')   { av = contactsByTenant[a.id] ?? 0; bv = contactsByTenant[b.id] ?? 0 }
      else if (sortKey === 'jobs')       { av = jobsByTenant[a.id] ?? 0;     bv = jobsByTenant[b.id] ?? 0 }
      else                               { av = a.created_at;   bv = b.created_at }

      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [tenants, search, sortKey, sortDir, contactsByTenant, jobsByTenant])

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={11} className="text-slate-700 ml-1" />
    return sortDir === 'asc'
      ? <ArrowUp size={11} className="text-blue-400 ml-1" />
      : <ArrowDown size={11} className="text-blue-400 ml-1" />
  }

  function Th({ col, label }: { col: SortKey; label: string }) {
    return (
      <th
        onClick={() => toggleSort(col)}
        className="text-left px-5 py-3 text-xs font-600 uppercase tracking-widest text-slate-600 cursor-pointer hover:text-slate-400 select-none"
      >
        <span className="flex items-center">
          {label}<SortIcon col={col} />
        </span>
      </th>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
      <div className="px-5 py-4 flex items-center gap-4" style={{ backgroundColor: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
        <h2 className="text-sm font-600 text-slate-300">All Clients ({tenants.length})</h2>
        <div className="relative ml-auto w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="search"
            placeholder="Search by name or slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600"
          />
        </div>
        {search && (
          <span className="text-xs text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a', backgroundColor: '#080808' }}>
              <Th col="business_name" label="Business" />
              <Th col="plan_tier"     label="Plan" />
              <th className="text-left px-5 py-3 text-xs font-600 uppercase tracking-widest text-slate-600">Status</th>
              <Th col="contacts" label="Contacts" />
              <Th col="jobs"     label="Jobs" />
              <Th col="created_at" label="Joined" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr
                key={t.id}
                style={{ borderBottom: '1px solid #111', backgroundColor: i % 2 === 0 ? '#080808' : '#0a0a0a' }}
              >
                <td className="px-5 py-3">
                  <p className="font-500 text-slate-200">{t.business_name}</p>
                  {t.website_slug && (
                    <p className="text-xs text-slate-600 mt-0.5 font-mono">{t.website_slug}</p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-500 ${PLAN_COLORS[t.plan_tier] ?? 'text-slate-400'}`}>
                    {PLAN_NAMES[t.plan_tier] ?? `Plan ${t.plan_tier}`}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-500 ${t.stripe_subscription_status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>
                    {t.stripe_subscription_status ?? 'unknown'}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400">{contactsByTenant[t.id] ?? 0}</td>
                <td className="px-5 py-3 text-slate-400">{jobsByTenant[t.id] ?? 0}</td>
                <td className="px-5 py-3 text-slate-500">{formatDate(t.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-600">
                  {search ? `No clients matching "${search}"` : 'No clients yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
