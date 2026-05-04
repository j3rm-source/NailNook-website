import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createAdminClient } from '@/lib/supabase/server'
import { cancelSmsSequence } from '@/lib/sms-sequence'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => { params[key] = value.toString() })

  const twilioSignature = request.headers.get('x-twilio-signature') ?? ''
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/sms`
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    twilioSignature,
    url,
    params
  )
  if (!isValid) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const fromPhone = params['From']
  const toNumber = params['To']

  const supabase = await createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('twilio_number', toNumber)
    .single()

  if (tenant) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, status')
      .eq('tenant_id', tenant.id)
      .eq('phone', fromPhone)
      .maybeSingle()

    if (contact) {
      // Cancel pending follow-up sequence — they replied
      await cancelSmsSequence(contact.id)

      if (contact.status === 'new') {
        await supabase
          .from('contacts')
          .update({ status: 'contacted' })
          .eq('id', contact.id)
      }
    }
  }

  // Return empty TwiML — Twilio handles STOP opt-outs automatically
  const twiml = new twilio.twiml.MessagingResponse()
  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
