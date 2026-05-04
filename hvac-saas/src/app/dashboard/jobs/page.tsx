import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import JobsKanban from './_components/jobs-kanban'

export const metadata: Metadata = { title: 'Jobs Pipeline' }

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const [{ data: jobs }, { data: contacts }, { data: tenant }] = await Promise.all([
    supabase
      .from('jobs')
      .select('*, contact:contacts(first_name, last_name, phone)')
      .eq('tenant_id', profile!.tenant_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .eq('tenant_id', profile!.tenant_id)
      .order('first_name'),
    supabase
      .from('tenants')
      .select('google_review_link, twilio_number')
      .eq('id', profile!.tenant_id)
      .single(),
  ])

  return (
    <JobsKanban
      initialJobs={jobs ?? []}
      contacts={contacts ?? []}
      tenantId={profile!.tenant_id}
      googleReviewLink={tenant?.google_review_link ?? null}
      twilioNumber={tenant?.twilio_number ?? null}
    />
  )
}
