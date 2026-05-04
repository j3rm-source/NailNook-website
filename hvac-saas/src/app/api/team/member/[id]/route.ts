import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await userClient
    .from('user_profiles').select('tenant_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = await createAdminClient()

  // Verify the target belongs to the same tenant and is not an owner
  const { data: target } = await admin
    .from('user_profiles')
    .select('id, role, tenant_id')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (!target) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  if (target.role === 'owner') return NextResponse.json({ error: 'Cannot remove the account owner' }, { status: 403 })

  await admin.from('user_profiles').delete().eq('id', id)
  await admin.auth.admin.deleteUser(id)

  return NextResponse.json({ ok: true })
}
