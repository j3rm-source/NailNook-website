'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Booking, Service, Staff, Session } from '@/lib/types'
import { StatsCards } from '@/components/admin/StatsCards'
import { BookingsTable } from '@/components/admin/BookingsTable'
import { ServicesManager } from '@/components/admin/ServicesManager'
import { StaffManager } from '@/components/admin/StaffManager'
import { Button } from '@/components/ui/Button'

type AdminTab = 'bookings' | 'services' | 'staff'

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [tab, setTab] = useState<AdminTab>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.error || data.role !== 'admin') {
          router.replace('/staff/login?redirect=/admin')
        } else {
          setSession(data)
          loadAll()
        }
      })
      .catch(() => router.replace('/staff/login?redirect=/admin'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, sRes, stRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/services'),
        fetch('/api/staff'),
      ])
      const [b, s, st] = await Promise.all([bRes.json(), sRes.json(), stRes.json()])
      setBookings(Array.isArray(b) ? b : [])
      setServices(Array.isArray(s) ? s : [])
      setStaff(Array.isArray(st) ? st : [])
    } finally {
      setLoading(false)
    }
  }, [])

  async function cancelBooking(id: string) {
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    await loadAll()
  }

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Admin Dashboard</h1>
            <p className="text-white/60 text-sm">{process.env.NEXT_PUBLIC_BUSINESS_NAME}</p>
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        {!loading && <StatsCards bookings={bookings} />}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-100 p-1 w-fit shadow-sm">
          {(['bookings', 'services', 'staff'] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-navy text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tab === 'bookings' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-lg">All Bookings</h2>
                <Button variant="secondary" size="sm" onClick={loadAll}>Refresh</Button>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading…</div>
              ) : (
                <BookingsTable bookings={bookings} onCancel={cancelBooking} />
              )}
            </div>
          )}

          {tab === 'services' && (
            <ServicesManager services={services} onRefresh={loadAll} />
          )}

          {tab === 'staff' && (
            <StaffManager staff={staff} onRefresh={loadAll} />
          )}
        </div>
      </main>
    </div>
  )
}
