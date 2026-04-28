'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface Props {
  tenantId: string
  primaryColor: string
}

export default function ContactForm({ tenantId, primaryColor }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/tenant/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          firstName: fd.get('first_name'),
          phone: fd.get('phone'),
          email: fd.get('email'),
          message: fd.get('message'),
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
          <Send size={24} style={{ color: primaryColor }} />
        </div>
        <h3 className="text-lg font-600 mb-2">Message sent!</h3>
        <p className="text-slate-400 text-sm">We'll get back to you shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-4" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-600 uppercase tracking-wide text-slate-400 mb-1.5">First Name *</label>
          <input
            name="first_name"
            required
            placeholder="John"
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }}
          />
        </div>
        <div>
          <label className="block text-xs font-600 uppercase tracking-wide text-slate-400 mb-1.5">Phone</label>
          <input
            name="phone"
            type="tel"
            placeholder="(555) 000-0000"
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-600 uppercase tracking-wide text-slate-400 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          placeholder="john@example.com"
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }}
        />
      </div>
      <div>
        <label className="block text-xs font-600 uppercase tracking-wide text-slate-400 mb-1.5">What do you need help with?</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Describe the issue..."
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none"
          style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400">Something went wrong — please try calling us directly.</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-600 text-sm transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: primaryColor, color: 'white' }}
      >
        <Send size={15} />
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
