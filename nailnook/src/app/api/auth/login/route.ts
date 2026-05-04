import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyPin, buildSessionCookieValue, COOKIE_NAME } from '@/lib/auth'

const supabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// Seed staff for demo mode (no Supabase)
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

    let staffId: string, staffName: string, role: string

    if (!supabaseConfigured()) {
      // Demo mode — match against seed users
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
      // Supabase mode
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
