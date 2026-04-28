import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const callerPhone = formData.get('From') as string
  const toNumber = formData.get('To') as string

  const supabase = await createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, business_name, plan_tier')
    .eq('twilio_number', toNumber)
    .single()

  if (!tenant || tenant.plan_tier < 2) {
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say('Sorry, we missed your call. Please leave a message after the beep.')
    twiml.record({ maxLength: 60 })
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  try {
    await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.BLAND_AI_API_KEY}` },
      body: JSON.stringify({
        phone_number: callerPhone,
        task: `You are a friendly receptionist for ${tenant.business_name}. The caller just tried to reach us and missed. Call them back, get their name, what service they need (AC/heating/plumbing), and their address. Offer to book an appointment. Be warm, professional, and concise.`,
        voice: 'maya',
        reduce_latency: true,
        webhook: `${appUrl}/api/bland/webhook?tenant_id=${tenant.id}`,
        metadata: { tenant_id: tenant.id, caller_phone: callerPhone },
      }),
    })
  } catch (err) {
    console.error('Bland AI trigger failed:', err)
  }

  const twiml = new twilio.twiml.VoiceResponse()
  twiml.say(`Thanks for calling ${tenant.business_name}. Our assistant is calling you right back!`)
  twiml.hangup()

  return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } })
}
