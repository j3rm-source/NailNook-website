'use client'

import { useState } from 'react'

interface Props {
  tenant: any
  profile: { full_name?: string | null; email?: string }
  saveGeneralSettings: (formData: FormData) => Promise<void>
}

export default function GeneralSettingsClient({ tenant, profile, saveGeneralSettings }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await saveGeneralSettings(new FormData(e.currentTarget))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Your Name</label>
          <input name="full_name" defaultValue={profile?.full_name ?? ''} className="input" placeholder="Jane Smith" />
        </div>
        <div>
          <label className="label">Email</label>
          <input defaultValue={profile?.email ?? ''} disabled className="input opacity-50 cursor-not-allowed" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Business Name</label>
          <input name="business_name" defaultValue={tenant?.business_name ?? ''} className="input" required />
        </div>
        <div>
          <label className="label">Area Code</label>
          <input
            name="area_code"
            defaultValue={tenant?.area_code ?? ''}
            placeholder="555"
            maxLength={3}
            className="input"
          />
          <p className="text-xs text-slate-600 mt-1">Used to provision your Twilio number.</p>
        </div>
      </div>
      {tenant?.twilio_number && (
        <div>
          <label className="label">Your Phone Number</label>
          <input defaultValue={tenant.twilio_number} disabled className="input opacity-50 cursor-not-allowed font-mono" />
        </div>
      )}
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-green-400">Saved!</span>}
      </div>
    </form>
  )
}
