import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase'
import { verifyPin, buildSessionCookieValue, COOKIE_NAME } from '@/lib/auth'

// Simple in-memory rate limiter (per process; resets on server restart)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (entry) {
    if (now > entry.resetAt) {
      loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 })
      return true
    }
    if (entry.count >= 10) return false
    entry.count++
    return true
  }
  loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 })
  return true
}

const SEED_USERS = [
  { id: 'seed-staff-1', name: 'Sarah Johnson', pin: '1234', role: 'staff' as const },
  { id: 'seed-staff-2', name: 'Mike Davis',    pin: '5678', role: 'staff' as const },
  { id: 'seed-admin-1', name: 'Admin',         pin: '0000', role: 'admin' as const },
]

export async function POST(request: NextRequest) {
  try {
    const { name, pin } = await request.json()

    if (!name || !pin) {
      return NextResponse.json({ error: 'Name and PIN are required' }, { status: 400 })
    }

    const rateLimitKey = `login:${name.trim().toLowerCase()}`
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json({ error: 'Too many attempts — try again in 15 minutes' }, { status: 429 })
    }

    let staffId: string, staffName: string, role: string

    if (!isSupabaseConfigured()) {
      const match = SEED_USERS.find(
        (u) => u.name.toLowerCase() === name.trim().toLowerCase() && u.pin === String(pin)
      )
      if (!match) {
        return NextResponse.json({ error: 'Invalid name or PIN' }, { status: 401 })
      }
      staffId = match.id
      staffName = match.name
      role = match.role
    } else {
      const supabase = createAdminClient()
      const { data: staffList, error } = await supabase
        .from('staff')
        .select('id, name, pin_hash, role')
        .ilike('name', name.trim())
        .limit(1)

      if (error || !staffList || staffList.length === 0) {
        return NextResponse.json({ error: 'Invalid name or PIN' }, { status: 401 })
      }

      const staff = staffList[0]
      const valid = await verifyPin(String(pin), staff.pin_hash)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid name or PIN' }, { status: 401 })
      }
      staffId = staff.id
      staffName = staff.name
      role = staff.role
    }

    const session = { staffId, name: staffName, role: role as 'staff' | 'admin' }
    const cookieValue = buildSessionCookieValue(session)

    const response = NextResponse.json({ success: true, role })
    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
