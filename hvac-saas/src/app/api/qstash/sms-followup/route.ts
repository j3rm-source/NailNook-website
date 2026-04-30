import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import twilio from 'twilio'
import { createAdminClient } from '@/lib/supabase/server'

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  })
  const isValid = await receiver.verify({
    signature: req.headers.get('upstash-signature') ?? '',
    body: rawBody,
  })
  if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  const { tenantId, to, body } = JSON.parse(rawBody) as {
    tenantId: string
    contactId: string
    to: string
    body: string
  }

  const supabase = await createAdminClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('twilio_number')
    .eq('id', tenantId)
    .single()

  if (!tenant?.twilio_number) {
    return NextResponse.json({ error: 'No Twilio number configured' }, { status: 400 })
  }

  await twilioClient.messages.create({ from: tenant.twilio_number, to, body })
  return NextResponse.json({ success: true })
}
