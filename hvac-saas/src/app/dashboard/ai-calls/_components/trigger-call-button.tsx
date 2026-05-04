'use client'

import { useState } from 'react'
import { Phone, X, Loader2 } from 'lucide-react'

export default function TriggerCallButton() {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [callId, setCallId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  function close() {
    setOpen(false)
    setPhone('')
    setStatus('idle')
    setCallId(null)
    setErrorMsg('')
  }

  async function trigger() {
    if (!phone.trim() || status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    const res = await fetch('/api/bland/create-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callerPhone: phone.trim() }),
    })

    if (res.ok) {
      const data = await res.json()
      setCallId(data.call_id)
      setStatus('success')
      setPhone('')
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error ?? 'Failed to trigger call. Check your Bland AI key.')
      setStatus('error')
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Phone size={15} /> Trigger AI Call
      </button>

      {open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-700 text-white">Trigger AI Call</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your AI receptionist will call this number immediately.</p>
              </div>
              <button onClick={close} className="btn-ghost w-8 h-8 p-0 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {status === 'success' ? (
                <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-center">
                  <Phone size={24} className="text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-600 text-sm">Call initiated!</p>
                  {callId && (
                    <p className="text-slate-500 text-xs mt-1 font-mono">ID: {callId}</p>
                  )}
                  <p className="text-slate-400 text-xs mt-2">The call will appear in this list once complete.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && trigger()}
                      className="input"
                      placeholder="+15551234567"
                      type="tel"
                      autoFocus
                    />
                    <p className="text-xs text-slate-600 mt-1">Include country code (e.g. +1 for US).</p>
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-400">{errorMsg}</p>
                  )}

                  <div className="flex gap-3">
                    <button onClick={close} className="btn-secondary flex-1">Cancel</button>
                    <button
                      onClick={trigger}
                      disabled={!phone.trim() || status === 'loading'}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Phone size={15} />}
                      {status === 'loading' ? 'Calling…' : 'Call Now'}
                    </button>
                  </div>
                </>
              )}

              {status === 'success' && (
                <button onClick={close} className="btn-secondary w-full">Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
