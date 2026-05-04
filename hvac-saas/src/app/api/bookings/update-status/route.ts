import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseUser
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId, status } = await request.json() as { bookingId: string; status: string }
  if (!bookingId || !status) return NextResponse.json({ error: 'bookingId and status required' }, { status: 400 })
  if (!['cancelled', 'no_show'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'upcoming')

  if (error) {
    console.error('Failed to update booking status:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
