import Link from 'next/link'
import {
  Phone, MessageSquare, Globe, BarChart3, CheckCircle2, Zap,
  Star, ArrowRight, Bot, Calendar, Users, Briefcase
} from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    color: 'blue',
    features: [
      'Professional booking website',
      'Basic CRM & contact management',
      'Jobs pipeline',
      'Cal.com booking widget',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$99',
    color: 'orange',
    features: [
      'Everything in Starter',
      'AI phone receptionist',
      'SMS follow-up sequences (t+0, 24h, 72h)',
      'SMS inbox',
      'Google ranking tools',
    ],
    cta: 'Most Popular',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$199',
    color: 'purple',
    features: [
      'Everything in Growth',
      'Analytics dashboard',
      'Lead gen tracking',
      'Ongoing optimization reports',
    ],
    cta: 'Go Pro',
    highlight: false,
  },
]

const TESTIMONIALS = [
  { name: 'Mike R.', biz: 'Mike\'s AC & Heat', text: 'I used to miss 30% of my calls. Now the AI picks up every single one. My booking rate went up 40% in the first month.' },
  { name: 'Donna S.', biz: 'Speedy Plumbing Co.', text: 'The SMS follow-ups practically run themselves. Leads that would\'ve gone cold now book within 24 hours.' },
  { name: 'James T.', biz: 'TrueTemp HVAC', text: 'Having my own booking website felt way out of reach before. TradeDesk set it all up in one afternoon.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-700 text-lg" style={{ letterSpacing: '-0.02em' }}>
              Trade<span style={{ background: 'linear-gradient(to right, #60a5fa, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Desk</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-600 px-4 py-2 rounded-xl transition-all hover:opacity-90" style={{ backgroundColor: '#2563eb', color: 'white' }}>
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 font-500" style={{ backgroundColor: '#172554', color: '#93c5fd', border: '1px solid #1d4ed8' }}>
          <Bot size={12} /> AI-powered · Built for trades
        </div>
        <h1 className="text-6xl md:text-7xl font-800 mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          Never Miss Another{' '}
          <span style={{ background: 'linear-gradient(to right, #60a5fa, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Service Call
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          TradeDesk gives HVAC and plumbing businesses an AI receptionist, automated SMS follow-ups, and a professional booking website — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 text-base font-600 px-8 py-4 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#2563eb', color: 'white', boxShadow: '0 4px 24px -4px rgba(37,99,235,0.5)' }}
          >
            Start Free Trial <ArrowRight size={17} />
          </Link>
          <Link
            href="#pricing"
            className="flex items-center gap-2 text-base font-500 px-8 py-4 rounded-xl border transition-all hover:bg-slate-800"
            style={{ borderColor: '#334155', color: '#94a3b8' }}
          >
            See Pricing
          </Link>
        </div>
        <p className="text-xs text-slate-600 mt-5">No credit card required for Starter · Cancel anytime</p>
      </section>

      {/* ── Problem / Solution ── */}
      <section style={{ borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', backgroundColor: '#080f1a' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-red-400 mb-4">The Problem</p>
            <h2 className="text-3xl font-700 mb-6" style={{ letterSpacing: '-0.02em' }}>One missed call = a lost job</h2>
            <div className="space-y-4 text-slate-400">
              <p>You're on a job, your phone rings, you can't answer. That caller? They just called your competitor.</p>
              <p>You follow up hours later. They've already booked someone else. This happens 10–20 times a week.</p>
              <p>Manual follow-ups take time you don't have. Hiring a receptionist costs $3,000+ a month.</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-green-400 mb-4">The Solution</p>
            <h2 className="text-3xl font-700 mb-6" style={{ letterSpacing: '-0.02em' }}>Your AI team, running 24/7</h2>
            <div className="space-y-3">
              {[
                { icon: Bot, label: 'AI Receptionist', desc: 'Answers missed calls, gathers info, offers booking link' },
                { icon: MessageSquare, label: 'SMS Follow-ups', desc: 'Automatic texts at t+0, 24hr, and 72hr — until they book' },
                { icon: Globe, label: 'Booking Website', desc: 'Professional site with Cal.com widget, ready in minutes' },
                { icon: BarChart3, label: 'Analytics', desc: 'Track leads, conversion rate, and pipeline revenue' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl p-3" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#172554' }}>
                    <Icon size={15} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-600 text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-center text-xs font-600 uppercase tracking-widest text-slate-500 mb-3">Everything you need</p>
        <h2 className="text-4xl font-700 text-center mb-16" style={{ letterSpacing: '-0.02em' }}>
          Built for the trades
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Phone, color: '#172554', iconColor: 'text-blue-400', title: 'AI Receptionist', desc: 'Your AI picks up missed calls, greets the caller by your business name, collects their info, and sends a booking link — all automatically.' },
            { icon: MessageSquare, color: '#1c1208', iconColor: 'text-orange-400', title: 'Smart SMS Sequences', desc: '3 automated follow-up texts: immediate, 24 hours, and 72 hours. Stops automatically when they book. Fully customizable.' },
            { icon: Globe, color: '#0a2010', iconColor: 'text-green-400', title: 'Booking Website', desc: 'A professional website with your services, Cal.com booking widget, and contact form — published in minutes with your branding.' },
            { icon: Users, color: '#172554', iconColor: 'text-blue-400', title: 'CRM', desc: 'Every lead from calls, texts, and your website automatically lands in your CRM with source tracking and status.' },
            { icon: Briefcase, color: '#1c1208', iconColor: 'text-orange-400', title: 'Jobs Pipeline', desc: 'Kanban board to move jobs from New → Quoted → Scheduled → In Progress → Completed. Tracks revenue at each stage.' },
            { icon: Star, color: '#1a1208', iconColor: 'text-yellow-400', title: 'Review Requests', desc: 'When a job is marked complete, a review request SMS goes out 2 hours later. More 5-star reviews on autopilot.' },
          ].map(({ icon: Icon, color, iconColor, title, desc }) => (
            <div key={title} className="rounded-2xl p-6 border transition-all hover:border-slate-600" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: color }}>
                <Icon size={18} className={iconColor} />
              </div>
              <h3 className="font-700 text-slate-100 mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ borderTop: '1px solid #1e293b', backgroundColor: '#080f1a' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-700 text-center mb-12" style={{ letterSpacing: '-0.02em' }}>Trusted by local service pros</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, biz, text }) => (
              <div key={name} className="rounded-2xl p-6 border" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-sm font-600 text-slate-200">{name}</p>
                  <p className="text-xs text-slate-500">{biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-700 text-center mb-3" style={{ letterSpacing: '-0.02em' }}>Simple, transparent pricing</h2>
        <p className="text-center text-slate-400 mb-14">Start free. Scale as you grow. Cancel anytime.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const borderColor = plan.highlight
              ? '#f97316'
              : plan.color === 'purple' ? '#7c3aed' : '#334155'
            const badgeBg = plan.highlight ? '#7c2d12' : plan.color === 'purple' ? '#2e1065' : '#172554'
            const badgeText = plan.highlight ? 'text-orange-300' : plan.color === 'purple' ? 'text-purple-300' : 'text-blue-300'
            return (
              <div
                key={plan.name}
                className="rounded-2xl p-7 border flex flex-col relative"
                style={{
                  backgroundColor: plan.highlight ? '#0f172a' : '#1e293b',
                  borderColor,
                  boxShadow: plan.highlight ? '0 0 40px -10px rgba(249,115,22,0.3)' : 'none',
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-700 px-3 py-1 rounded-full" style={{ backgroundColor: '#f97316', color: 'white' }}>
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <span className={`text-xs font-600 px-2.5 py-1 rounded-full ${badgeText}`} style={{ backgroundColor: badgeBg }}>
                    {plan.name}
                  </span>
                </div>
                <p className="text-4xl font-800 mb-1">{plan.price}<span className="text-base font-400 text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-500 mb-6">billed monthly</p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: plan.highlight ? '#f97316' : '#3b82f6' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/signup?plan=${plan.color === 'blue' ? '1' : plan.color === 'orange' ? '2' : '3'}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-600 text-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: plan.highlight ? '#f97316' : plan.color === 'purple' ? '#7c3aed' : '#2563eb',
                    color: 'white',
                  }}
                >
                  {plan.cta === 'Most Popular' ? 'Get Started' : plan.cta} <ArrowRight size={14} />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: '1px solid #1e293b', backgroundColor: '#080f1a' }}>
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-700 mb-4" style={{ letterSpacing: '-0.02em' }}>
            Stop losing jobs to missed calls
          </h2>
          <p className="text-slate-400 text-lg mb-10">Join HVAC and plumbing pros who use TradeDesk to fill their schedule automatically.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-base font-600 px-10 py-4 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#2563eb', color: 'white', boxShadow: '0 4px 24px -4px rgba(37,99,235,0.4)' }}
          >
            Start Free Today <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #0f172a', backgroundColor: '#080f1a' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Zap size={11} className="text-white" />
            </div>
            <span className="font-700 text-sm text-slate-400">TradeDesk</span>
          </div>
          <p className="text-xs text-slate-700">© {new Date().getFullYear()} TradeDesk. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Log in</Link>
            <Link href="/signup" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
