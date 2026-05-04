import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { hashPin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const admin = createAdminClient()

    // If PIN is being updated, hash it
    if (body.pin) {
      body.pin_hash = await hashPin(String(body.pin))
      delete body.pin
    }

    const { data, error } = await admin
      .from('staff')
      .update(body)
      .eq('id', id)
      .select('id, name, color, photo_url, role, phone')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
