'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

interface TopbarProps {
  userEmail: string
  userName: string
}

export default function DashboardTopbar({ userEmail, userName }: TopbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Left — breadcrumb / search can go here */}
      <div />

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          id="btn-notifications"
          className="btn-ghost w-9 h-9 rounded-xl p-0 relative"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            id="btn-user-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-700/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-700">
              {getInitials(userName)}
            </div>
            <span className="text-sm text-slate-300 max-w-[120px] truncate hidden sm:block">
              {userName}
            </span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-700 bg-slate-800 shadow-xl z-50 py-1 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-700">
                <p className="text-xs font-500 text-slate-300 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>

              <button
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-slate-100 transition-colors"
                onClick={() => { setMenuOpen(false); router.push('/dashboard/settings') }}
              >
                <User size={14} />
                Account settings
              </button>

              <button
                id="btn-logout"
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
