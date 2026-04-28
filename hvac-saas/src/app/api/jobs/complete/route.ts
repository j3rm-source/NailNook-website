import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { reviewQueue } from '@/lib/queue'

export async function PATCH(request: NextRequest) {
  const { jobId } = await request.json() as { jobId: string }

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Mark job completed
  const { data: job, error } = await supabase
    .from('jobs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', jobId)
    .select('id, tenant_id, contact_id')
    .single()

  if (error || !job) {
    console.error('Failed to complete job:', error)
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Fetch contact phone + tenant review link
  const [{ data: contact }, { data: tenant }] = await Promise.all([
    supabase.from('contacts').select('phone, first_name').eq('id', job.contact_id).single(),
    supabase.from('tenants').select('business_name, google_review_link, twilio_number').eq('id', job.tenant_id).single(),
  ])

  // Only send review request if we have a phone and review link
  if (contact?.phone && tenant?.google_review_link && tenant?.twilio_number) {
    await reviewQueue.add(
      'send-review-request',
      {
        tenantId: job.tenant_id,
        contactId: job.contact_id,
        contactPhone: contact.phone,
        businessName: tenant.business_name,
        reviewLink: tenant.google_review_link,
      },
      {
        delay: 2 * 60 * 60 * 1000, // 2 hours
        attempts: 2,
      }
    )
  }

  return NextResponse.json({ success: true })
}
