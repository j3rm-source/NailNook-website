import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseUser
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await request.json() as { phone: string }
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const supabase = await createAdminClient()

  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .eq('tenant_id', profile.tenant_id)
    .eq('phone', phone)
    .maybeSingle()

  if (!contact) {
    return NextResponse.json({ error: 'No contact found for this number' }, { status: 404 })
  }

  const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      tenant_id: profile.tenant_id,
      contact_id: contact.id,
      title: `Follow-up with ${name}`,
      status: 'new',
    })
    .select('id')
    .single()

  if (error || !job) {
    console.error('Failed to create job from SMS:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  return NextResponse.json({ jobId: job.id, contactName: name })
}
