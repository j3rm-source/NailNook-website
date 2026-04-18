import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { hashPin } from '@/lib/auth'

const SEED_STAFF = [
  { id: 'seed-staff-1', name: 'Sarah Johnson', color: '#4ECDC4', photo_url: null, role: 'staff' },
  { id: 'seed-staff-2', name: 'Mike Davis', color: '#45B7D1', photo_url: null, role: 'staff' },
]

const supabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

// GET /api/staff — public, returns non-sensitive fields only
export async function GET() {
  if (!supabaseConfigured()) return NextResponse.json(SEED_STAFF)

  const { data, error } = await createAdminClient()
    .from('staff')
    .select('id, name, color, photo_url, role')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/staff — admin only
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, pin, phone, color, role } = body

    if (!name || !pin) {
      return NextResponse.json({ error: 'name and pin required' }, { status: 400 })
    }

    const pin_hash = await hashPin(String(pin))
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('staff')
      .insert({ name, pin_hash, phone, color: color || '#E94560', role: role || 'staff' })
      .select('id, name, color, photo_url, role, phone')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
