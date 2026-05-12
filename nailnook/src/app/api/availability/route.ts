import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

function seedAvailability(staffId: string) {
  return [1, 2, 3, 4, 5].map((dow) => ({
    id: `seed-avail-${staffId}-${dow}`,
    staff_id: staffId,
    day_of_week: dow,
    specific_date: null,
    start_time: '09:00:00',
    end_time: '17:00:00',
    is_available: true,
    created_at: new Date().toISOString(),
  }))
}

// GET /api/availability?staffId=X
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get('staffId')

  if (!staffId) return NextResponse.json({ error: 'staffId required' }, { status: 400 })
  if (!isSupabaseConfigured()) return NextResponse.json(seedAvailability(staffId))

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('availability')
    .select('*')
    .eq('staff_id', staffId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/availability — bulk save for a staff member's week, admin only
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { staffId, slots } = body

    if (!staffId || !Array.isArray(slots)) {
      return NextResponse.json({ error: 'staffId and slots array required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const specificDates = slots
      .filter((s: { specific_date?: string }) => s.specific_date)
      .map((s: { specific_date: string }) => s.specific_date)

    if (specificDates.length > 0) {
      await admin
        .from('availability')
        .delete()
        .eq('staff_id', staffId)
        .in('specific_date', specificDates)
    }

    const rows = slots.map((slot: Record<string, unknown>) => ({
      ...slot,
      staff_id: staffId,
    }))

    const { data, error } = await admin.from('availability').insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/availability — upsert recurring availability, admin only
export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { staffId, recurring } = body

    if (!staffId || !Array.isArray(recurring)) {
      return NextResponse.json({ error: 'staffId and recurring array required' }, { status: 400 })
    }

    const admin = createAdminClient()

    await admin
      .from('availability')
      .delete()
      .eq('staff_id', staffId)
      .is('specific_date', null)

    const rows = recurring.map((slot: Record<string, unknown>) => ({
      ...slot,
      staff_id: staffId,
      specific_date: null,
    }))

    const { data, error } = await admin.from('availability').insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
