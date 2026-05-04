import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, body } = await req.json() as { to: string; body: string }
  if (!to || !body) return NextResponse.json({ error: 'to and body required' }, { status: 400 })

  const supabaseAdmin = await createAdminClient()
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('twilio_number')
    .eq('id', profile.tenant_id)
    .single()

  if (!tenant?.twilio_number) {
    return NextResponse.json({ error: 'No Twilio number configured' }, { status: 400 })
  }

  await twilioClient.messages.create({ from: tenant.twilio_number, to, body })
  return NextResponse.json({ success: true })
}
