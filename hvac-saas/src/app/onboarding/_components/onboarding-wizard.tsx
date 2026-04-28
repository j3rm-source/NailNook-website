'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Wrench, Phone, Globe, CheckCircle2, ChevronRight, Plus, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tenant: {
    id: string
    business_name: string
    area_code: string | null
    services: string[]
    twilio_number: string | null
    website_slug: string | null
  } | null
}

const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Services',      icon: Wrench },
  { id: 3, label: 'Phone Setup',   icon: Phone },
  { id: 4, label: 'Website',       icon: Globe },
  { id: 5, label: 'Go Live',       icon: CheckCircle2 },
]

export default function OnboardingWizard({ tenant }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [provisioningPhone, setProvisioningPhone] = useState(false)

  // Step 1 — Business info
  const [businessName, setBusinessName] = useState(tenant?.business_name ?? '')
  const [areaCode, setAreaCode] = useState(tenant?.area_code ?? '')

  // Step 2 — Services
  const [services, setServices] = useState<string[]>(tenant?.services ?? [])
  const [newService, setNewService] = useState('')

  // Step 3 — Phone
  const [twilioNumber, setTwilioNumber] = useState(tenant?.twilio_number ?? '')

  // Step 4 — Website
  const [slug, setSlug] = useState(tenant?.website_slug ?? businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  async function saveStep1() {
    setSaving(true)
    await supabase.from('tenants').update({ business_name: businessName, area_code: areaCode || null }).eq('id', tenant!.id)
    setSaving(false)
    setStep(2)
  }

  async function saveStep2() {
    setSaving(true)
    await supabase.from('tenants').update({ services }).eq('id', tenant!.id)
    setSaving(false)
    setStep(3)
  }

  async function provisionPhone() {
    if (!areaCode || twilioNumber) { setStep(4); return }
    setProvisioningPhone(true)
    try {
      const res = await fetch('/api/twilio/provision-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant!.id, areaCode }),
      })
      const data = await res.json()
      if (data.phone_number) setTwilioNumber(data.phone_number)
    } catch {
      // Non-fatal — they can configure manually
    }
    setProvisioningPhone(false)
    setStep(4)
  }

  async function saveStep4() {
    setSaving(true)
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    await supabase.from('tenants').update({ website_slug: cleanSlug }).eq('id', tenant!.id)
    setSaving(false)
    setStep(5)
  }

  function addService() {
    const s = newService.trim()
    if (s && !services.includes(s)) setServices(prev => [...prev, s])
    setNewService('')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-12">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-sm font-500 transition-colors ${step >= s.id ? 'text-blue-400' : 'text-slate-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 border transition-all ${step > s.id ? 'bg-blue-500 border-blue-500 text-white' : step === s.id ? 'border-blue-500 text-blue-400' : 'border-slate-700 text-slate-600'}`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px transition-colors ${step > s.id ? 'bg-blue-500' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* ── Step 1: Business Info ── */}
        {step === 1 && (
          <StepCard title="Tell us about your business" subtitle="We'll use this to set up your profile.">
            <div className="space-y-4">
              <div>
                <label className="label">Business Name *</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="input" placeholder="Smith HVAC & Plumbing" required />
              </div>
              <div>
                <label className="label">Phone Area Code</label>
                <input value={areaCode} onChange={e => setAreaCode(e.target.value)} className="input" placeholder="555" maxLength={3} pattern="\d{3}" />
                <p className="text-xs text-slate-600 mt-1">We'll provision a local number in this area code for your AI receptionist.</p>
              </div>
            </div>
            <StepButton onClick={saveStep1} loading={saving} disabled={!businessName}>
              Continue
            </StepButton>
          </StepCard>
        )}

        {/* ── Step 2: Services ── */}
        {step === 2 && (
          <StepCard title="What services do you offer?" subtitle="Add the services you provide — they'll show on your website.">
            <div className="space-y-3">
              {services.map(s => (
                <div key={s} className="flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
                  <Wrench size={13} className="text-blue-400 shrink-0" />
                  <span className="text-sm text-slate-200 flex-1">{s}</span>
                  <button type="button" onClick={() => setServices(prev => prev.filter(x => x !== s))} className="text-slate-600 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  value={newService}
                  onChange={e => setNewService(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
                  className="input flex-1"
                  placeholder="e.g. AC Repair"
                />
                <button type="button" onClick={addService} className="btn-secondary px-3">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
              <StepButton onClick={saveStep2} loading={saving} className="flex-1">
                Continue
              </StepButton>
            </div>
          </StepCard>
        )}

        {/* ── Step 3: Phone Setup ── */}
        {step === 3 && (
          <StepCard title="Your dedicated phone number" subtitle="We'll provision a local number that rings your AI receptionist when you miss a call.">
            {twilioNumber ? (
              <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-6 text-center">
                <CheckCircle2 size={28} className="text-green-400 mx-auto mb-3" />
                <p className="text-2xl font-700 text-green-300 font-mono">{twilioNumber}</p>
                <p className="text-sm text-slate-400 mt-2">Your number is ready! Forward missed calls from this number to activate your AI receptionist.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 text-center">
                <Phone size={28} className="text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">We'll provision a local {areaCode || 'XXX'} area code number for you.</p>
                {!areaCode && <p className="text-xs text-orange-400 mt-2">Go back and add your area code first.</p>}
              </div>
            )}

            {!twilioNumber && areaCode && (
              <p className="text-xs text-slate-500 mt-3 text-center">Note: provisioning costs ~$1.15/month. You can skip this in dev mode.</p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1">Back</button>
              {twilioNumber ? (
                <button onClick={() => setStep(4)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <StepButton onClick={provisionPhone} loading={provisioningPhone} className="flex-1">
                  {areaCode ? 'Get My Number' : 'Skip for Now'}
                </StepButton>
              )}
            </div>
          </StepCard>
        )}

        {/* ── Step 4: Website ── */}
        {step === 4 && (
          <StepCard title="Set up your booking website" subtitle="Your clients can find and book you at this URL.">
            <div>
              <label className="label">Website URL</label>
              <div className="flex items-center">
                <span className="text-sm text-slate-500 bg-slate-800/60 border border-r-0 border-slate-700 rounded-l-xl px-3 py-[0.625rem] whitespace-nowrap">
                  {appUrl.replace('https://', '').replace('http://', '')}/
                </span>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="input rounded-l-none flex-1"
                  placeholder="smith-hvac"
                />
              </div>
              <p className="text-xs text-slate-600 mt-1">Lowercase letters, numbers, and hyphens only.</p>
            </div>

            {slug && (
              <div className="mt-3 rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Preview URL</p>
                <p className="text-sm text-blue-400 font-mono">{appUrl}/{slug}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="btn-ghost flex-1">Back</button>
              <StepButton onClick={saveStep4} loading={saving} disabled={!slug} className="flex-1">
                Continue
              </StepButton>
            </div>
          </StepCard>
        )}

        {/* ── Step 5: Go Live ── */}
        {step === 5 && (
          <StepCard title="You're all set! 🎉" subtitle="Your account is ready. Let's go to your dashboard.">
            <div className="space-y-3">
              {[
                { done: !!businessName, label: 'Business profile configured' },
                { done: services.length > 0, label: `${services.length} service${services.length !== 1 ? 's' : ''} added` },
                { done: !!twilioNumber, label: twilioNumber ? `Phone number: ${twilioNumber}` : 'Phone number (optional — add later)' },
                { done: !!slug, label: slug ? `Website: ${appUrl}/${slug}` : 'Website URL (add in settings)' },
              ].map(({ done, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={16} className={done ? 'text-green-400' : 'text-slate-600'} />
                  <span className={done ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-base py-3"
            >
              Go to Dashboard <ChevronRight size={16} />
            </button>
          </StepCard>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-700 text-white">{title}</h1>
        <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function StepButton({ onClick, loading, disabled, children, className = '' }: {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-primary flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      {children}
      {!loading && <ChevronRight size={15} />}
    </button>
  )
}
