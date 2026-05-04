'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface Voice { value: string; label: string }

interface Props {
  tenant: {
    ai_voice: string | null
    ai_greeting: string | null
    ai_call_hours: string | null
    ai_transfer_number: string | null
    business_name: string
    services: string[]
  } | null
  voices: Voice[]
  save: (formData: FormData) => Promise<void>
}

export default function AiReceptionistClient({ tenant, voices, save }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [greeting, setGreeting] = useState(tenant?.ai_greeting ?? '')

  const businessName = tenant?.business_name ?? 'your business'
  const defaultGreeting = `Hi! Thanks for calling ${businessName}. I'm the virtual receptionist.`

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await save(new FormData(e.currentTarget))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Voice */}
      <div className="card space-y-4">
        <h2 className="text-sm font-600 text-slate-300">Voice & Personality</h2>
        <div>
          <label className="label">Voice</label>
          <select name="ai_voice" defaultValue={tenant?.ai_voice ?? 'maya'} className="input">
            {voices.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-1">The voice your AI receptionist uses on calls.</p>
        </div>

        <div>
          <label className="label">Custom Greeting</label>
          <input
            name="ai_greeting"
            value={greeting}
            onChange={e => setGreeting(e.target.value)}
            className="input"
            placeholder={defaultGreeting}
          />
          <p className="text-xs text-slate-600 mt-1">Leave blank to use the auto-generated greeting.</p>
        </div>
      </div>

      {/* Hours & Transfer */}
      <div className="card space-y-4">
        <h2 className="text-sm font-600 text-slate-300">Availability & Routing</h2>
        <div>
          <label className="label">Business Hours</label>
          <input
            name="ai_call_hours"
            defaultValue={tenant?.ai_call_hours ?? ''}
            className="input"
            placeholder="e.g. Monday–Friday 8am–6pm CT"
          />
          <p className="text-xs text-slate-600 mt-1">The AI will mention these hours when callers ask about scheduling.</p>
        </div>

        <div>
          <label className="label">Live Transfer Number</label>
          <input
            name="ai_transfer_number"
            defaultValue={tenant?.ai_transfer_number ?? ''}
            className="input"
            placeholder="+15551234567"
            type="tel"
          />
          <p className="text-xs text-slate-600 mt-1">If set, the AI will offer to transfer emergency callers to this number.</p>
        </div>
      </div>

      {/* Preview */}
      {greeting && (
        <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4 flex gap-3">
          <Info size={15} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-600 text-blue-300 mb-1">Greeting preview</p>
            <p className="text-sm text-slate-300 italic">"{greeting}"</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="text-sm text-green-400">Saved!</span>}
      </div>
    </form>
  )
}
