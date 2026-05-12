import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { hashPin, requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await request.json()

    // Whitelist allowed fields
    const update: Record<string, unknown> = {}
    if (body.name !== undefined) update.name = body.name
    if (body.phone !== undefined) update.phone = body.phone || null
    if (body.color !== undefined) update.color = body.color
    if (body.role !== undefined) update.role = body.role

    // Hash PIN if being updated
    if (body.pin) {
      update.pin_hash = await hashPin(String(body.pin))
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('staff')
      .update(update)
      .eq('id', id)
      .select('id, name, color, photo_url, role, phone')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const admin = createAdminClient()
    const { error } = await admin.from('staff').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
