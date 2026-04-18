'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AvailabilityGrid } from '@/components/dashboard/AvailabilityGrid'
import { BookingsSidebar } from '@/components/dashboard/BookingsSidebar'
import { Button } from '@/components/ui/Button'
import { Session } from '@/lib/types'

export default function StaffDashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Read session from cookie via API
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace('/staff/login')
        } else {
          setSession(data)
        }
      })
      .catch(() => router.replace('/staff/login'))
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/staff/login')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Dashboard</h1>
            <p className="text-white/60 text-sm">Welcome back, {session.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-white/60 hover:text-white text-sm transition-colors">
              ← Booking page
            </a>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Availability grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">My Availability</h2>
            <AvailabilityGrid staffId={session.staffId} />
          </div>

          {/* Upcoming bookings */}
          <BookingsSidebar staffId={session.staffId} />
        </div>
      </main>
    </div>
  )
}
