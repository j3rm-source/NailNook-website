'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '60d', days: 60 },
  { label: '90d', days: 90 },
] as const

export default function DateRangePicker({ currentDays }: { currentDays: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setDays(days: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('days', String(days))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-1">
      {PRESETS.map(p => (
        <button
          key={p.days}
          onClick={() => setDays(p.days)}
          className={cn(
            'text-xs px-3 py-1.5 rounded-lg font-500 transition-colors',
            currentDays === p.days
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
