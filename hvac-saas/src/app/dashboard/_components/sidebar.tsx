'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Briefcase, CalendarCheck,
  MessageSquare, Phone, BarChart3, Settings,
  CreditCard, Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPlanFeatures, type PlanTier } from '@/lib/types'

const SETTINGS_ITEMS = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Billing', href: '/dashboard/settings/billing', icon: CreditCard },
]

const PLAN_LABELS: Record<PlanTier, { label: string; color: string }> = {
  1: { label: 'Starter', color: 'badge-blue' },
  2: { label: 'Growth', color: 'badge-orange' },
  3: { label: 'Pro', color: 'bg-purple-500/15 text-purple-300 border border-purple-500/30 badge' },
}

interface SidebarProps {
  businessName: string
  planTier: PlanTier
}

export default function DashboardSidebar({ businessName, planTier }: SidebarProps) {
  const pathname = usePathname()
  const features = getPlanFeatures(planTier)

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      always: true,
    },
    {
      label: 'Contacts',
      href: '/dashboard/contacts',
      icon: Users,
      always: true,
    },
    {
      label: 'Jobs',
      href: '/dashboard/jobs',
      icon: Briefcase,
      always: true,
    },
    {
      label: 'Bookings',
      href: '/dashboard/bookings',
      icon: CalendarCheck,
      always: true,
    },
    {
      label: 'SMS Inbox',
      href: '/dashboard/sms',
      icon: MessageSquare,
      show: features.hasSMSFollowups,
      badge: 'Plan 2',
    },
    {
      label: 'AI Calls',
      href: '/dashboard/ai-calls',
      icon: Phone,
      show: features.hasAIReceptionist,
      badge: 'Plan 2',
    },
    {
      label: 'Website',
      href: '/dashboard/website',
      icon: Globe,
      always: true,
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      show: features.hasAnalytics,
      badge: 'Plan 3',
    },
  ]

  const planInfo = PLAN_LABELS[planTier]

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#080808', borderRight: '1px solid #111' }}>
      {/* Logo + Business */}
      <div className="p-5" style={{ borderBottom: '1px solid #111' }}>
        <Link href="/dashboard" className="flex items-center mb-3">
          <img src="/logo.png" alt="J2 Systems" style={{ height: 160, width: 'auto', maxWidth: '100%' }} />
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 truncate max-w-[140px]">{businessName}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-500', planInfo.color)}>
            {planInfo.label}
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-600 uppercase tracking-widest px-3 py-2 mt-1" style={{ color: '#333' }}>
          Main
        </div>

        {navItems.map((item) => {
          if (!item.always && !item.show) {
            // Show locked item with upgrade nudge
            return (
              <Link
                key={item.href}
                href="/dashboard/settings/billing"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-500 text-slate-600 transition-all duration-150 hover:text-slate-400 group"
              >
                <item.icon size={17} />
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] badge bg-slate-700/40 text-slate-600 border-slate-700/40">
                  {item.badge}
                </span>
              </Link>
            )
          }

          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          )
        })}

        <div className="text-[10px] font-600 uppercase tracking-widest px-3 py-2 mt-4" style={{ color: '#333' }}>
          Account
        </div>

        {SETTINGS_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? 'sidebar-link-active' : 'sidebar-link')}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade CTA for Plan 1 */}
      {planTier === 1 && (
        <div className="p-3" style={{ borderTop: '1px solid #111' }}>
          <Link
            href="/dashboard/settings/billing"
            className="block rounded-xl p-3 text-center transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'rgba(0,212,184,0.08)', border: '1px solid rgba(0,212,184,0.2)' }}
          >
            <p className="text-xs font-600" style={{ color: '#00d4b8' }}>Upgrade to Growth</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,212,184,0.5)' }}>Get AI receptionist + SMS</p>
          </Link>
        </div>
      )}
    </aside>
  )
}
