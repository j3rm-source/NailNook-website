'use client'

import { Search } from 'lucide-react'

interface Props {
  slug: string
  primaryColor: string
}

export default function PortalForm({ slug, primaryColor }: Props) {
  return (
    <form
      method="GET"
      action={`/${slug}/portal`}
      className="flex gap-3 max-w-md mx-auto"
    >
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="tel"
          name="phone"
          required
          placeholder="Your phone number"
          className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2.5 rounded-xl text-sm font-600 text-white transition-all hover:opacity-90 shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        Look Up
      </button>
    </form>
  )
}
