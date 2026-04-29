import Link from 'next/link'
import { Phone, MessageSquare, Globe, BarChart3, CheckCircle2, ArrowRight, Bot, Users, Briefcase } from 'lucide-react'
import RoiCalculator from './_components/roi-calculator'

const BRAND = 'var(--brand-500)'

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    plan: '1',
    features: ['Professional booking website', 'CRM & contact management', 'Jobs pipeline', 'Cal.com booking widget'],
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$99',
    plan: '2',
    features: ['Everything in Starter', 'AI phone receptionist', 'SMS follow-ups (t+0, 24h, 72h)', 'SMS inbox'],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$199',
    plan: '3',
    features: ['Everything in Growth', 'Analytics dashboard', 'Lead gen tracking', 'Monthly optimization reports'],
    highlight: false,
  },
]

const COMPARISON: { feature: string; human: boolean }[] = [
  { feature: 'Answers every missed call',        human: true  },
  { feature: 'Sends booking link automatically', human: true  },
  { feature: '3-touch SMS follow-up sequence',   human: true  },
  { feature: 'Professional booking website',     human: true  },
  { feature: 'Full CRM & jobs pipeline',         human: true  },
  { feature: 'Available 24/7',                   human: false },
  { feature: 'No sick days or holidays',         human: false },
  { feature: 'Costs under $200/mo',              human: false },
]

const INDUSTRIES = ['HVAC', 'PLUMBING', 'AC REPAIR', 'HEATING', 'WATER HEATER', 'DRAIN CLEANING', 'ELECTRICAL', 'AND MORE']

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#050505', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif', minHeight: '100vh' }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: '1px solid #111111', position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="J2 Systems" style={{ height: 112, width: 'auto' }} />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-500" style={{ color: '#666' }}>
            <a href="#how-it-works" className="hover:text-white transition-colors">HOW IT WORKS</a>
            <a href="#pricing" className="hover:text-white transition-colors">PRICING</a>
            <Link href="/login" className="hover:text-white transition-colors">LOGIN</Link>
          </div>
          <Link
            href="/signup"
            className="text-sm font-700 px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND, color: '#050505' }}
          >
            START HERE →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
        <div
          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 font-600 uppercase tracking-widest"
          style={{ backgroundColor: 'rgba(0,212,184,0.08)', color: BRAND, border: `1px solid rgba(0,212,184,0.2)` }}
        >
          <Bot size={11} /> AI-powered · Built for trades
        </div>
        <h1 className="text-6xl md:text-7xl font-800 mb-6 text-white" style={{ letterSpacing: '-0.035em', lineHeight: 1.05 }}>
          AI THAT TURNS{' '}
          <span style={{ color: BRAND}}>MISSED CALLS</span>
          <br />INTO BOOKED JOBS
        </h1>
        <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: '#666', lineHeight: 1.7 }}>
          J2 Systems gives HVAC and plumbing businesses an AI receptionist that answers every missed call, sends SMS follow-ups automatically, and fills your schedule — 24/7.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 text-base font-700 px-8 py-4 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND, color: '#050505', boxShadow: '0 4px 30px -4px rgba(0,212,184,0.4)' }}
          >
            TRY FREE DEMO <ArrowRight size={17} />
          </Link>
          <a
            href="#pricing"
            className="flex items-center gap-2 text-base font-500 px-8 py-4 rounded-xl border transition-all"
            style={{ borderColor: '#222', color: '#888' }}
          >
            See Pricing
          </a>
        </div>
        <p className="text-xs mt-5" style={{ color: '#333' }}>No credit card required to start</p>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ borderTop: '1px solid #111', borderBottom: '1px solid #111', backgroundColor: '#080808' }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            { stat: '47%', label: 'of callers never leave a voicemail' },
            { stat: '78%', label: 'book with the first business that responds' },
            { stat: '$3,200', label: 'average monthly cost of a human receptionist' },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <p className="text-4xl md:text-5xl font-800 mb-1" style={{ color: BRAND}}>{stat}</p>
              <p className="text-sm" style={{ color: '#555' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROI Calculator ── */}
      <RoiCalculator />

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-center text-xs font-700 uppercase tracking-widest mb-3" style={{ color: BRAND}}>
          Here is how it works...
        </p>
        <h2 className="text-4xl md:text-5xl font-800 text-center mb-16" style={{ letterSpacing: '-0.03em' }}>
          Three steps. Fully automatic.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', title: 'Missed call comes in', desc: 'A customer calls your Twilio number. You\'re on the job and can\'t pick up. J2 Systems\'s AI immediately calls them back — within seconds.' },
            { n: '02', title: 'AI collects their info', desc: 'The AI greets them by your business name, asks what service they need, gets their address, and offers to send a booking link.' },
            { n: '03', title: 'SMS sequence fires', desc: 'If they don\'t book on the call, 3 automated follow-up texts go out: right away, 24 hours later, and 72 hours later. Stops when they book.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="rounded-2xl p-7" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <p className="text-6xl font-800 mb-4" style={{ color: '#1a1a1a', letterSpacing: '-0.04em' }}>{n}</p>
              <h3 className="text-lg font-700 text-white mb-3">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Industries ── */}
      <div style={{ borderTop: '1px solid #111', borderBottom: '1px solid #111', backgroundColor: '#080808' }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-center text-xs font-700 uppercase tracking-widest mb-6" style={{ color: '#444' }}>
            Industries we serve
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {INDUSTRIES.map(ind => (
              <span key={ind} className="text-xs font-700 uppercase tracking-widest px-4 py-2 rounded-full" style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', color: '#888' }}>
                {ind}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-center text-xs font-700 uppercase tracking-widest mb-3" style={{ color: BRAND}}>Everything you need</p>
        <h2 className="text-4xl md:text-5xl font-800 text-center mb-16" style={{ letterSpacing: '-0.03em' }}>
          Built for the trades
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Phone, title: 'AI Receptionist', desc: 'Answers missed calls by your business name, gathers info, and offers a booking link. Sounds human. Works 24/7.' },
            { icon: MessageSquare, title: 'Smart SMS Sequences', desc: '3 automated follow-up texts at t+0, 24hr, and 72hr. Stops automatically when they book. Fully customizable.' },
            { icon: Globe, title: 'Booking Website', desc: 'A professional site with your services, Cal.com booking widget, and contact form — published in minutes.' },
            { icon: Users, title: 'CRM', desc: 'Every lead from calls, texts, and your website lands in your CRM automatically with source tracking and status.' },
            { icon: Briefcase, title: 'Jobs Pipeline', desc: 'Kanban board: New → Quoted → Scheduled → In Progress → Completed. Tracks revenue at every stage.' },
            { icon: BarChart3, title: 'Analytics', desc: 'Conversion rates, pipeline revenue, lead source breakdown. Know exactly what\'s working.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-6 transition-all hover:border-[#00d4b8]/30 group" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(0,212,184,0.1)' }}>
                <Icon size={18} style={{ color: BRAND}} />
              </div>
              <h3 className="font-700 text-white mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section style={{ borderTop: '1px solid #111', backgroundColor: '#080808' }}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <p className="text-center text-xs font-700 uppercase tracking-widest mb-3" style={{ color: BRAND}}>
            Does J2 Systems have the following?
          </p>
          <h2 className="text-4xl font-800 text-center mb-14" style={{ letterSpacing: '-0.03em' }}>
            J2 Systems vs. a human receptionist
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
            <div className="grid grid-cols-3 text-xs font-700 uppercase tracking-widest px-6 py-4" style={{ backgroundColor: '#0d0d0d', borderBottom: '1px solid #1a1a1a', color: '#555' }}>
              <span className="col-span-1">Feature</span>
              <span className="text-center" style={{ color: BRAND}}>J2 Systems</span>
              <span className="text-center">Human Receptionist</span>
            </div>
            {COMPARISON.map(({ feature, human }, i) => (
              <div
                key={feature}
                className="grid grid-cols-3 items-center px-6 py-4"
                style={{ backgroundColor: i % 2 === 0 ? '#080808' : '#0a0a0a', borderBottom: '1px solid #111' }}
              >
                <span className="text-sm" style={{ color: '#aaa' }}>{feature}</span>
                <div className="flex justify-center">
                  <CheckCircle2 size={18} style={{ color: BRAND }} />
                </div>
                <div className="flex justify-center">
                  {human
                    ? <CheckCircle2 size={18} style={{ color: '#333' }} />
                    : <span className="text-xl" style={{ color: '#ef4444' }}>✗</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-center text-xs font-700 uppercase tracking-widest mb-3" style={{ color: BRAND}}>Pricing</p>
        <h2 className="text-4xl md:text-5xl font-800 text-center mb-3" style={{ letterSpacing: '-0.03em' }}>Simple, honest pricing</h2>
        <p className="text-center mb-14" style={{ color: '#555' }}>Cancel anytime. No long-term contracts.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col relative"
              style={{
                backgroundColor: plan.highlight ? '#0d0d0d' : '#080808',
                border: `1px solid ${plan.highlight ? BRAND: '#1a1a1a'}`,
                boxShadow: plan.highlight ? `0 0 40px -10px rgba(0,212,184,0.25)` : 'none',
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-700 px-3 py-1 rounded-full" style={{ backgroundColor: BRAND, color: '#050505' }}>
                  Most Popular
                </div>
              )}
              <p className="text-sm font-700 uppercase tracking-widest mb-4" style={{ color: plan.highlight ? BRAND: '#555' }}>{plan.name}</p>
              <p className="text-5xl font-800 mb-1 text-white">{plan.price}<span className="text-base font-400 ml-1" style={{ color: '#444' }}>/mo</span></p>
              <p className="text-xs mb-8" style={{ color: '#444' }}>billed monthly</p>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#888' }}>
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: plan.highlight ? BRAND: '#333' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/signup?plan=${plan.plan}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-700 text-sm transition-all hover:opacity-90"
                style={{
                  backgroundColor: plan.highlight ? BRAND: '#111',
                  color: plan.highlight ? '#050505' : '#888',
                  border: plan.highlight ? 'none' : '1px solid #222',
                }}
              >
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ backgroundColor: BRAND}}>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-800 mb-4" style={{ color: '#050505', letterSpacing: '-0.03em' }}>
            Stop losing jobs to missed calls
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'rgba(5,5,5,0.65)' }}>
            Join HVAC and plumbing pros who use J2 Systems to fill their schedule automatically.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-base font-700 px-10 py-4 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#050505', color: BRAND}}
          >
            Talk to an Expert <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#030303', borderTop: '1px solid #111' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="J2 Systems" style={{ height: 112, width: 'auto', opacity: 0.6 }} />
          </div>
          <p className="text-xs" style={{ color: '#333' }}>© {new Date().getFullYear()} J2 Systems. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs transition-colors hover:text-white" style={{ color: '#444' }}>Log in</Link>
            <Link href="/signup" className="text-xs transition-colors hover:text-white" style={{ color: '#444' }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
