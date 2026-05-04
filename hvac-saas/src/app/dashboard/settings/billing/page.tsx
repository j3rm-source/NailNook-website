import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CreditCard, CheckCircle2, Zap } from 'lucide-react'
import UpgradeButton from './_components/upgrade-button'

export const metadata: Metadata = { title: 'Billing' }

const PLAN_INFO = {
  1: { name: 'Foundation',       price: '$197/mo', color: 'text-blue-400',   badge: 'badge-blue' },
  2: { name: 'Growth System',    price: '$497/mo', color: 'text-orange-400', badge: 'badge-orange' },
  3: { name: 'Revenue Partner',  price: '$997/mo', color: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/30 badge' },
} as const

const PLAN_FEATURES: Record<1 | 2 | 3, string[]> = {
  1: ['Professional website + booking page', 'CRM & contacts', 'Jobs pipeline', 'Cal.com booking widget'],
  2: ['Everything in Foundation', 'AI phone receptionist', 'SMS follow-up sequences', 'SMS inbox', 'Google SEO management'],
  3: ['Everything in Growth System', 'Analytics dashboard', 'Lead gen tracking', 'Paid ads management', 'Monthly performance report'],
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('plan_tier, stripe_subscription_status, stripe_subscription_id')
    .eq('id', profile!.tenant_id)
    .single()

  const tier = (tenant?.plan_tier ?? 1) as 1 | 2 | 3
  const plan = PLAN_INFO[tier]
  const status = tenant?.stripe_subscription_status

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-700 text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your subscription.</p>
      </div>

      {/* Current plan card */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Zap size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="font-600 text-slate-200">{plan.name} Plan</p>
              <p className={`text-sm font-500 ${plan.color}`}>{plan.price}</p>
            </div>
          </div>
          <span className={plan.badge}>{status === 'active' ? 'Active' : status ?? 'Unknown'}</span>
        </div>

        <ul className="space-y-2">
          {PLAN_FEATURES[tier].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* Manage subscription via Stripe portal */}
        <form action="/api/stripe/portal" method="POST">
          <button type="submit" className="btn-secondary w-full flex items-center justify-center gap-2">
            <CreditCard size={15} /> Manage Subscription
          </button>
        </form>
      </div>

      {/* Upgrade prompts — open Stripe portal so plan change modifies existing subscription */}
      {tier < 3 && (
        <div className="space-y-3">
          <h2 className="text-xs font-600 uppercase tracking-widest text-slate-500">Upgrade your plan</h2>

          {tier === 1 && (
            <div className="card border-orange-500/30 bg-orange-500/5 space-y-3">
              <div>
                <p className="font-600 text-orange-300">Growth System — $497/mo</p>
                <p className="text-sm text-slate-400 mt-0.5">AI receptionist, SMS follow-ups, and more</p>
              </div>
              <ul className="space-y-1.5">
                {PLAN_FEATURES[2].slice(1).map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 size={13} className="text-orange-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <UpgradeButton
                label="Upgrade to Growth System"
                className="btn-accent w-full py-2.5 rounded-xl font-600 text-sm"
              />
            </div>
          )}

          {tier <= 2 && (
            <div className="card border-purple-500/30 bg-purple-500/5 space-y-3">
              <div>
                <p className="font-600 text-purple-300">Revenue Partner — $997/mo</p>
                <p className="text-sm text-slate-400 mt-0.5">Analytics, lead tracking, ongoing optimization</p>
              </div>
              <ul className="space-y-1.5">
                {PLAN_FEATURES[3].slice(1).map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <UpgradeButton
                label="Upgrade to Revenue Partner"
                className="w-full py-2.5 rounded-xl font-600 text-sm bg-purple-600 text-white hover:bg-purple-500 transition-colors"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
