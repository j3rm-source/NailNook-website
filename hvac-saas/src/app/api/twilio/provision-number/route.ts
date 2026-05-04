import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: profile } = await admin
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const areaCode = body.area_code?.replace(/\D/g, '').slice(0, 3)
  if (!areaCode || areaCode.length !== 3) {
    return NextResponse.json({ error: 'Invalid area code' }, { status: 400 })
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const available = await client.availablePhoneNumbers('US')
    .local.list({ areaCode: Number(areaCode), limit: 1 })

  if (!available.length) {
    return NextResponse.json({ error: `No numbers available in area code ${areaCode}` }, { status: 404 })
  }

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: available[0].phoneNumber,
    voiceUrl: `${appUrl}/api/twilio/voice`,
    voiceMethod: 'POST',
    smsUrl: `${appUrl}/api/twilio/sms`,
    smsMethod: 'POST',
  })

  await admin.from('tenants')
    .update({ twilio_number: purchased.phoneNumber, area_code: areaCode })
    .eq('id', profile.tenant_id)

  return NextResponse.json({ phone_number: purchased.phoneNumber })
}
