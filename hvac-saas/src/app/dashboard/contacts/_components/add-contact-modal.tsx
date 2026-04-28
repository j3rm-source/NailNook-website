'use client'

import { useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Contact, ContactSource } from '@/lib/types'

interface AddContactModalProps {
  tenantId: string
  onClose: () => void
  onAdded: (contact: Contact) => void
}

const SOURCES: { value: ContactSource; label: string }[] = [
  { value: 'manual', label: 'Manual entry' },
  { value: 'website_form', label: 'Website form' },
  { value: 'ai_call', label: 'AI Call' },
  { value: 'sms_reply', label: 'SMS reply' },
  { value: 'cal_booking', label: 'Booking' },
]

export default function AddContactModal({ tenantId, onClose, onAdded }: AddContactModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('contacts')
        .insert({
          tenant_id: tenantId,
          first_name: fd.get('first_name') as string,
          last_name: (fd.get('last_name') as string) || null,
          phone: (fd.get('phone') as string) || null,
          email: (fd.get('email') as string) || null,
          source: fd.get('source') as ContactSource,
          issue_type: (fd.get('issue_type') as string) || null,
          notes: (fd.get('notes') as string) || null,
        })
        .select('*')
        .single()

      if (err) { setError(err.message); return }
      onAdded(data as Contact)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-700 text-white">Add Contact</h2>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input id="contact-first-name" name="first_name" required className="input" placeholder="John" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input id="contact-last-name" name="last_name" className="input" placeholder="Smith" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input id="contact-phone" name="phone" type="tel" className="input" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="label">Email</label>
              <input id="contact-email" name="email" type="email" className="input" placeholder="john@email.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Source</label>
              <select id="contact-source" name="source" className="input">
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Issue Type</label>
              <input id="contact-issue" name="issue_type" className="input" placeholder="e.g. AC repair" />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea id="contact-notes" name="notes" className="input resize-none h-20" placeholder="Any additional details…" />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button id="btn-save-contact" type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
