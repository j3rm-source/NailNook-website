import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

const SEED_SERVICES = [
  { id: 'seed-svc-1', name: 'Haircut', price: 45, duration_minutes: 45, description: 'Professional haircut and styling tailored to your look.', active: true, created_at: new Date().toISOString() },
  { id: 'seed-svc-2', name: 'Color', price: 120, duration_minutes: 90, description: 'Full color treatment with premium products.', active: true, created_at: new Date().toISOString() },
  { id: 'seed-svc-3', name: 'Blowout', price: 35, duration_minutes: 30, description: 'Blowout and styling for a polished finish.', active: true, created_at: new Date().toISOString() },
]

const supabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

// GET /api/services — public, returns active services
export async function GET() {
  if (!supabaseConfigured()) return NextResponse.json(SEED_SERVICES)

  const { data, error } = await createAdminClient()
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/services — admin only
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, duration_minutes, description } = body

    if (!name || price == null || !duration_minutes) {
      return NextResponse.json({ error: 'name, price, duration_minutes required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('services')
      .insert({ name, price: Number(price), duration_minutes: Number(duration_minutes), description })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
