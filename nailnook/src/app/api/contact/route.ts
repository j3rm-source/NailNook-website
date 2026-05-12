import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, buildInquiryConfirmationCustomerSMS, buildInquiryNotificationSpecialistSMS, normalizePhone } from '@/lib/twilio'
import { createAdminClient } from '@/lib/supabase'

const OWNER_PHONE = process.env.OWNER_PHONE || '+19284863524'

async function getSpecialistPhone(specialistName: string): Promise<string | null> {
  if (!specialistName || specialistName === 'First Available') return null
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

  const { name, phone, email, service, specialist, preferredTime, message } = body

  if (!name?.trim() || !phone?.trim() || !email?.trim() || !service?.trim() || !preferredTime?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const specialistLabel = specialist?.trim() || 'First Available'

  const ownerSms = [
    '📍 New Booking Request – The Nail Nook',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Service: ${service}`,
    `Specialist: ${specialistLabel}`,
    `Preferred Time: ${preferredTime}`,
    `Message: ${message?.trim() || 'None'}`,
  ].join('\n')

  // Always notify owner
  try {
    await sendSMS(OWNER_PHONE, ownerSms)
  } catch (err) {
    console.error('[contact] Owner SMS error:', err)
  }

  // Notify specialist directly (if one was chosen and has a phone on file)
  const specialistPhone = await getSpecialistPhone(specialistLabel)
  if (specialistPhone) {
    try {
      await sendSMS(specialistPhone, buildInquiryNotificationSpecialistSMS(name, service, preferredTime, phone))
    } catch (err) {
      console.error('[contact] Specialist SMS error:', err)
    }
  }

  // Confirm to customer
  const customerPhone = normalizePhone(phone)
  if (customerPhone) {
    try {
      await sendSMS(customerPhone, buildInquiryConfirmationCustomerSMS(name, service))
    } catch (err) {
      console.error('[contact] Customer SMS error:', err)
    }
  }

  return NextResponse.json({ success: true })
}
