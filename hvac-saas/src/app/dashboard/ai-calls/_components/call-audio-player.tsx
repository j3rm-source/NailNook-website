'use client'

import { useState } from 'react'
import { Play, Loader2, MicOff } from 'lucide-react'

export default function CallAudioPlayer({ callId }: { callId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle')
  const [url, setUrl] = useState<string | null>(null)

  async function load() {
    setState('loading')
    const res = await fetch(`/api/bland/recording?callId=${encodeURIComponent(callId)}`)
    const data = await res.json()
    if (res.ok && data.url) {
      setUrl(data.url)
      setState('ready')
    } else {
      setState('unavailable')
    }
  }

  if (state === 'idle') {
    return (
      <button
        onClick={load}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-400 transition-colors"
      >
        <Play size={12} /> Play recording
      </button>
    )
  }

  if (state === 'loading') {
    return (
      <span className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 size={12} className="animate-spin" /> Loading…
      </span>
    )
  }

  if (state === 'unavailable') {
    return (
      <span className="flex items-center gap-2 text-xs text-slate-600">
        <MicOff size={12} /> No recording available
      </span>
    )
  }

  return (
    <audio
      src={url!}
      controls
      className="w-full h-8 mt-1"
      style={{ colorScheme: 'dark' }}
    />
  )
}
