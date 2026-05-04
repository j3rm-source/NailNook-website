import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { publishDelayed } from '@/lib/qstash'

export async function PATCH(request: NextRequest) {
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseUser
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobId } = await request.json() as { jobId: string }
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const supabase = await createAdminClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('tenant_id', profile.tenant_id)
    .select('id, tenant_id, contact_id')
    .single()

  if (error || !job) {
    console.error('Failed to complete job:', error)
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const [{ data: contact }, { data: tenant }] = await Promise.all([
    supabase.from('contacts').select('phone, first_name').eq('id', job.contact_id).single(),
    supabase.from('tenants').select('business_name, google_review_link, twilio_number').eq('id', job.tenant_id).single(),
  ])

  if (contact?.phone && tenant?.google_review_link && tenant?.twilio_number) {
    await publishDelayed(
      '/api/qstash/review-request',
      {
        tenantId: job.tenant_id,
        contactId: job.contact_id,
        contactPhone: contact.phone,
        businessName: tenant.business_name,
        reviewLink: tenant.google_review_link,
      },
      2 * 60 * 60 // 2 hours
    )
  }

  return NextResponse.json({ success: true })
}
