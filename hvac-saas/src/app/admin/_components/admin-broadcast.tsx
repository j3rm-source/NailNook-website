'use client'

import { useState } from 'react'
import { Send, Megaphone } from 'lucide-react'

export default function AdminBroadcast() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [sent, setSent] = useState(0)

  async function send() {
    if (!subject.trim() || !message.trim()) return
    setState('sending')
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message }),
    })
    if (res.ok) {
      const data = await res.json()
      setSent(data.sent)
      setState('done')
      setSubject('')
      setMessage('')
    } else {
      setState('error')
    }
  }

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
      <div className="flex items-center gap-2">
        <Megaphone size={15} className="text-orange-400" />
        <h2 className="text-sm font-600 text-slate-300">Broadcast Message</h2>
        <span className="text-xs text-slate-600 ml-1">— sends to all active clients</span>
      </div>

      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Subject line…"
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600"
      />
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Message body… (plain text, will be formatted as email)"
        rows={4}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600 resize-none"
      />

      <div className="flex items-center gap-4">
        <button
          onClick={send}
          disabled={!subject.trim() || !message.trim() || state === 'sending'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/15 text-orange-300 text-sm font-500 hover:bg-orange-500/25 transition-colors disabled:opacity-40 border border-orange-500/20"
        >
          <Send size={13} />
          {state === 'sending' ? 'Sending…' : 'Send to all clients'}
        </button>
        {state === 'done' && <span className="text-sm text-green-400">Sent to {sent} client{sent !== 1 ? 's' : ''}</span>}
        {state === 'error' && <span className="text-sm text-red-400">Failed — check logs</span>}
      </div>
    </div>
  )
}
