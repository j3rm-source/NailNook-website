'use client'

import { useState } from 'react'
import { Globe, Image, Palette } from 'lucide-react'

interface Props {
  tenant: any
  saveWebsiteSettings: (formData: FormData) => Promise<void>
}

export default function WebsiteSettingsClient({ tenant, saveWebsiteSettings }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [color, setColor] = useState(tenant?.primary_color ?? '#2563eb')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    fd.set('primary_color', color)
    await saveWebsiteSettings(fd)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-700 text-white">Website Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Customize your public booking website.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Slug */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-sm font-600 text-slate-300 mb-1">
            <Globe size={15} className="text-blue-400" /> Website URL
          </div>
          <div>
            <label className="label">Website Slug</label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-slate-500 bg-slate-800/60 border border-r-0 border-slate-700 rounded-l-xl px-3 py-[0.625rem]">
                {process.env.NEXT_PUBLIC_APP_URL ?? 'localhost:3000'}/
              </span>
              <input
                name="website_slug"
                defaultValue={tenant?.website_slug ?? ''}
                placeholder="my-hvac-company"
                className="input rounded-l-none flex-1"
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">Lowercase letters, numbers, and hyphens only.</p>
          </div>
        </div>

        {/* Branding */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-sm font-600 text-slate-300 mb-1">
            <Image size={15} className="text-blue-400" /> Branding
          </div>
          <div>
            <label className="label">Business Name</label>
            <input name="business_name" defaultValue={tenant?.business_name ?? ''} className="input" required />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input name="tagline" defaultValue={tenant?.tagline ?? ''} placeholder="Fast, reliable local service" className="input" />
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <Palette size={12} /> Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="input w-32 font-mono text-sm"
                pattern="#[0-9a-fA-F]{6}"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card space-y-4">
          <div className="text-sm font-600 text-slate-300 mb-1">Content</div>
          <div>
            <label className="label">Services (one per line)</label>
            <textarea
              name="services"
              defaultValue={tenant?.services?.join('\n') ?? ''}
              rows={6}
              placeholder="AC Repair&#10;Furnace Installation&#10;Drain Cleaning&#10;Water Heater Service"
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">About Us</label>
            <textarea
              name="about_text"
              defaultValue={tenant?.about_text ?? ''}
              rows={4}
              placeholder="Tell customers a bit about your business..."
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">Google Review Link</label>
            <input
              name="google_review_link"
              type="url"
              defaultValue={tenant?.google_review_link ?? ''}
              placeholder="https://g.page/r/..."
              className="input"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-400">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
