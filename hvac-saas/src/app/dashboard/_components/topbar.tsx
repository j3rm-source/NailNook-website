'use client'

import { useState, useEffect, useRef } from 'react'
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
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 shrink-0" style={{ borderBottom: '1px solid #111', backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)' }}>
      <div />

      <div className="flex items-center gap-3">
        <button className="btn-ghost w-9 h-9 rounded-xl p-0 relative" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand-500)' }} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="btn-ghost flex items-center gap-2.5 rounded-xl px-3 py-2"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-700" style={{ backgroundColor: 'var(--brand-500)', color: '#050505' }}>
              {getInitials(userName)}
            </div>
            <span className="text-sm max-w-[120px] truncate hidden sm:block" style={{ color: '#aaa' }}>
              {userName}
            </span>
            <ChevronDown size={14} style={{ color: '#444' }} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl z-50 py-1 animate-fade-in" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1e1e1e' }}>
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #1a1a1a' }}>
                <p className="text-xs font-500 truncate" style={{ color: '#aaa' }}>{userName}</p>
                <p className="text-xs truncate" style={{ color: '#555' }}>{userEmail}</p>
              </div>

              <button
                className="btn-ghost w-full flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-none"
                onClick={() => { setMenuOpen(false); router.push('/dashboard/settings') }}
              >
                <User size={14} />
                Account settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors rounded-none"
                style={{ color: '#ef4444' }}
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
