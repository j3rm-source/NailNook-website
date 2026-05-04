'use client'

import { useEffect, useState } from 'react'
import { Send, StickyNote } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Note {
  id: string
  body: string
  created_at: string
}

export default function JobNotes({ jobId }: { jobId: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/jobs/notes?jobId=${jobId}`)
      .then(r => r.json())
      .then(d => setNotes(d.notes ?? []))
      .finally(() => setLoading(false))
  }, [jobId])

  async function addNote() {
    const body = draft.trim()
    if (!body || saving) return
    setSaving(true)
    const res = await fetch('/api/jobs/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, body }),
    })
    if (res.ok) {
      const { note } = await res.json()
      setNotes(prev => [note, ...prev])
      setDraft('')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-600 uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
        <StickyNote size={11} /> Notes
      </p>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addNote() }}
          placeholder="Add a note… (Enter to save)"
          className="input flex-1 text-sm h-9"
        />
        <button
          onClick={addNote}
          disabled={!draft.trim() || saving}
          className="btn-secondary px-3 disabled:opacity-40"
        >
          <Send size={13} />
        </button>
      </div>

      {loading && <p className="text-xs text-slate-600">Loading…</p>}

      {!loading && notes.length === 0 && (
        <p className="text-xs text-slate-600 italic">No notes yet.</p>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {notes.map(note => (
          <div key={note.id} className="rounded-xl bg-slate-800/60 border border-slate-700/40 px-3 py-2">
            <p className="text-sm text-slate-300 leading-relaxed">{note.body}</p>
            <p className="text-xs text-slate-600 mt-1">{formatDateTime(note.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
