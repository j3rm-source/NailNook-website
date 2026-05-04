'use client'

import { useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Contact, ContactStatus, ContactSource } from '@/lib/types'

interface Props {
  contact: Contact
  onClose: () => void
  onSaved: (updated: Contact) => void
}

const SOURCES: { value: ContactSource; label: string }[] = [
  { value: 'manual',       label: 'Manual entry' },
  { value: 'website_form', label: 'Website form' },
  { value: 'ai_call',      label: 'AI Call' },
  { value: 'sms_reply',    label: 'SMS reply' },
  { value: 'cal_booking',  label: 'Booking' },
]

const STATUSES: { value: ContactStatus; label: string }[] = [
  { value: 'new',       label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'booked',    label: 'Booked' },
  { value: 'won',       label: 'Won' },
  { value: 'lost',      label: 'Lost' },
]

export default function EditContactModal({ contact, onClose, onSaved }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const supabase = createClient()
      const patch = {
        first_name:  fd.get('first_name') as string,
        last_name:   (fd.get('last_name') as string) || null,
        phone:       (fd.get('phone') as string) || null,
        email:       (fd.get('email') as string) || null,
        source:      fd.get('source') as ContactSource,
        status:      fd.get('status') as ContactStatus,
        issue_type:  (fd.get('issue_type') as string) || null,
        notes:       (fd.get('notes') as string) || null,
        address:     (fd.get('address') as string) || null,
      }

      const { data, error: err } = await supabase
        .from('contacts')
        .update(patch)
        .eq('id', contact.id)
        .select('*')
        .single()

      if (err) { setError(err.message); return }
      onSaved(data as Contact)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-lg font-700 text-white">Edit Contact</h2>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input name="first_name" required defaultValue={contact.first_name} className="input" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input name="last_name" defaultValue={contact.last_name ?? ''} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input name="phone" type="tel" defaultValue={contact.phone ?? ''} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" defaultValue={contact.email ?? ''} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={contact.status} className="input">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <select name="source" defaultValue={contact.source} className="input">
                {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Issue Type</label>
              <input name="issue_type" defaultValue={contact.issue_type ?? ''} className="input" placeholder="e.g. AC repair" />
            </div>
            <div>
              <label className="label">Address</label>
              <input name="address" defaultValue={contact.address ?? ''} className="input" placeholder="123 Main St" />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea name="notes" defaultValue={contact.notes ?? ''} className="input resize-none h-20" placeholder="Any additional details…" />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
