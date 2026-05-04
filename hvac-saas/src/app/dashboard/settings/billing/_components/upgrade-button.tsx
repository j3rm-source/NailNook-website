'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

interface Props {
  label: string
  className?: string
}

export default function UpgradeButton({ label, className = '' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
      {label}
    </button>
  )
}
