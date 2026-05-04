import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await userClient
    .from('user_profiles').select('tenant_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email } = await request.json() as { email: string }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Check if this email is already on this tenant's team
  const { data: existingProfile } = await admin
    .from('user_profiles')
    .select('id')
    .eq('tenant_id', profile.tenant_id)
    .eq('email', email)
    .maybeSingle()
  if (existingProfile) {
    return NextResponse.json({ error: 'This person is already on your team.' }, { status: 409 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/login`,
    data: { tenant_id: profile.tenant_id, role: 'staff' },
  })

  if (error || !invited?.user) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to send invite' }, { status: 500 })
  }

  // Create user_profile immediately so they're visible in the team list
  const { error: profileError } = await admin.from('user_profiles').insert({
    id: invited.user.id,
    tenant_id: profile.tenant_id,
    email,
    role: 'staff',
  })

  if (profileError) {
    // Roll back: delete the auth user so we don't leave an orphan
    await admin.auth.admin.deleteUser(invited.user.id)
    console.error('Profile insert failed:', profileError)
    return NextResponse.json({ error: 'Failed to create team member profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
