import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, buildInquiryConfirmationCustomerSMS, buildInquiryNotificationSpecialistSMS, normalizePhone } from '@/lib/twilio'
import { createAdminClient } from '@/lib/supabase'

const OWNER_PHONE = '+19284863524'

async function getSpecialistPhone(specialistName: string): Promise<string | null> {
  if (!specialistName || specialistName === 'No Preference') return null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('staff')
      .select('phone')
      .ilike('name', specialistName)
      .single()
    return data?.phone ? normalizePhone(data.phone) : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { customerName, customerPhone, service, specialist, preferredTime } = body

  if (!customerName?.trim() || !customerPhone?.trim() || !service?.trim() || !preferredTime?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const normalizedCustomerPhone = normalizePhone(customerPhone)

  // SMS to customer
  if (normalizedCustomerPhone) {
    try {
      await sendSMS(normalizedCustomerPhone, buildInquiryConfirmationCustomerSMS(customerName, service))
    } catch (err) {
      console.error('[chat-booking] Customer SMS error:', err)
    }
  }

  const notificationSms = buildInquiryNotificationSpecialistSMS(customerName, service, preferredTime, customerPhone)
  const specialistPhone = await getSpecialistPhone(specialist)

  // SMS to specialist (falls back to owner if no phone on file)
  try {
    await sendSMS(specialistPhone ?? OWNER_PHONE, notificationSms)
  } catch (err) {
    console.error('[chat-booking] Specialist SMS error:', err)
  }

  // If specialist had their own phone, also notify owner
  if (specialistPhone) {
    try {
      await sendSMS(OWNER_PHONE, notificationSms)
    } catch (err) {
      console.error('[chat-booking] Owner SMS error:', err)
    }
  }

  return NextResponse.json({ success: true })
}