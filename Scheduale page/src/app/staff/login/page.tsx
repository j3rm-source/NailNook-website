'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function StaffLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/staff/dashboard'

  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || pin.length < 4) {
      setError('Enter your name and 4-digit PIN')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Invalid name or PIN')
        return
      }

      router.push(data.role === 'admin' ? '/admin' : '/staff/dashboard')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white text-xl font-bold shadow-lg">
            ✦
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Login</h1>
          <p className="mt-1 text-white/50 text-sm">Enter your name and PIN to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
            />

            {/* PIN input */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">PIN</label>
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-colors"
                    style={{
                      borderColor: pin.length > i ? '#E94560' : '#e5e7eb',
                      color: '#1A1A2E',
                    }}
                  >
                    {pin.length > i ? '•' : ''}
                  </div>
                ))}
              </div>
              {/* Hidden input that captures actual PIN */}
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="opacity-0 h-0 w-0 absolute"
                aria-label="PIN"
                onFocus={(e) => {
                  // Scroll the visible PIN display into view
                  e.target.parentElement?.scrollIntoView({ block: 'nearest' })
                }}
              />
              {/* Tap-to-focus */}
              <button
                type="button"
                className="w-full mt-2 text-center text-xs text-gray-400 hover:text-gray-600"
                onClick={() => {
                  const hidden = document.querySelector<HTMLInputElement>('input[aria-label="PIN"]')
                  hidden?.focus()
                }}
              >
                Tap to enter PIN
              </button>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => pin.length < 4 && setPin((p) => p + n)}
                  className="h-12 rounded-xl border border-gray-100 text-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-accent/30 transition-all active:scale-95"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-12 rounded-xl border border-gray-100 text-sm text-gray-400 hover:bg-gray-50 transition-all"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => pin.length < 4 && setPin((p) => p + '0')}
                className="h-12 rounded-xl border border-gray-100 text-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-accent/30 transition-all active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPin((p) => p.slice(0, -1))}
                className="h-12 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all"
              >
                ⌫
              </button>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={pin.length < 4 || !name.trim()}
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center mt-4 text-sm text-white/40">
          <a href="/" className="hover:text-white/70 transition-colors">← Back to booking</a>
        </p>
      </div>
    </div>
  )
}
