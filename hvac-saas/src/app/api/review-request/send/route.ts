import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseUser
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobId } = await request.json() as { jobId: string }
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const supabase = await createAdminClient()

  const [{ data: job }, { data: tenant }] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, contact:contacts(first_name, phone)')
      .eq('id', jobId)
      .eq('tenant_id', profile.tenant_id)
      .single(),
    supabase
      .from('tenants')
      .select('business_name, google_review_link, twilio_number')
      .eq('id', profile.tenant_id)
      .single(),
  ])

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const contact = (Array.isArray(job.contact) ? job.contact[0] : job.contact) as { first_name: string; phone: string | null } | null
  if (!contact?.phone) return NextResponse.json({ error: 'Contact has no phone number' }, { status: 400 })
  if (!tenant?.google_review_link) return NextResponse.json({ error: 'No Google review link configured' }, { status: 400 })
  if (!tenant?.twilio_number) return NextResponse.json({ error: 'No Twilio number configured' }, { status: 400 })

  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  const body = `Hi ${contact.first_name}! Thanks for choosing ${tenant.business_name}. If we did a great job today, a quick Google review would mean the world to us! ${tenant.google_review_link}`

  await twilioClient.messages.create({
    from: tenant.twilio_number,
    to: contact.phone,
    body,
  })

  return NextResponse.json({ success: true })
}
