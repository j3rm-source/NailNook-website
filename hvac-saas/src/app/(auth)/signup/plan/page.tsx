'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Zap, Building2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    tier: 1 as const,
    name: 'Foundation',
    price: '$200',
    period: '/mo',
    setup: '$900',
    description: 'Everything you need to look professional and never miss a booking.',
    icon: Building2,
    color: 'blue',
    features: [
      'Professional HVAC website',
      'Online booking system',
      'Contact & lead CRM',
      'Job pipeline tracker',
      'Email notifications',
    ],
    cta: 'Start with Foundation',
  },
  {
    tier: 2 as const,
    name: 'Growth System',
    price: '$500',
    period: '/mo',
    setup: '$1,000',
    description: 'Add AI and automation — turn missed calls into booked jobs automatically.',
    icon: Zap,
    color: 'orange',
    popular: true,
    features: [
      'Everything in Foundation',
      '24/7 AI phone receptionist',
      'Automated SMS follow-ups',
      'Google ranking boost',
      'Call transcripts & summaries',
      'SMS inbox & templates',
    ],
    cta: 'Start with Growth System',
  },
  {
    tier: 3 as const,
    name: 'Revenue Partner',
    price: '$1,000',
    period: '/mo',
    setup: '$4,000',
    description: 'Full-service growth engine with analytics and ongoing optimization.',
    icon: BarChart3,
    color: 'purple',
    features: [
      'Everything in Growth System',
      'Lead source tracking',
      'Advanced analytics dashboard',
      'Ongoing SEO optimization',
      'Monthly performance reports',
      'Priority support',
    ],
    cta: 'Start with Revenue Partner',
  },
]

export default function PlanSelectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function selectPlan(tier: 1 | 2 | 3) {
    setLoading(tier)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: tier }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong')
      }

      router.push(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-800 text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Choose your plan
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isLoading = loading === plan.tier

            return (
              <div
                key={plan.tier}
                className={cn(
                  'card relative flex flex-col',
                  plan.popular && 'border-orange-500/50 glow-orange'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge-orange text-xs px-3 py-1 font-600">Most Popular</span>
                  </div>
                )}

                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                  plan.color === 'blue' && 'bg-blue-500/15 text-blue-400',
                  plan.color === 'orange' && 'bg-orange-500/15 text-orange-400',
                  plan.color === 'purple' && 'bg-purple-500/15 text-purple-400',
                )}>
                  <Icon size={24} />
                </div>

                <div className="mb-1">
                  <span className="text-xs font-600 uppercase tracking-wider text-slate-500">{plan.name}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-800 text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <div className="mb-3 text-sm text-amber-400 font-500">
                  + {plan.setup} one-time setup fee
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{plan.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check size={15} className="text-green-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  id={`btn-plan-${plan.tier}`}
                  onClick={() => selectPlan(plan.tier)}
                  disabled={loading !== null}
                  className={cn(
                    'w-full btn',
                    plan.popular ? 'btn-accent' : 'btn-secondary',
                    loading !== null && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> Redirecting…</>
                  ) : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-slate-600 mt-10">
          All plans include a 14-day free trial. Prices shown in USD.
        </p>
      </div>
    </div>
  )
}
