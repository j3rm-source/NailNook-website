import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'

const OWNER_PHONE = '+19284863524'

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, phone, email, service, preferredTime, message } = body

  if (!name?.trim() || !phone?.trim() || !email?.trim() || !service?.trim() || !preferredTime?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const smsBody = [
    '📍 New Inquiry – The Nail Nook',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Service: ${service}`,
    `Preferred Time: ${preferredTime}`,
    `Message: ${message?.trim() || 'None'}`,
  ].join('\n')

  try {
    await sendSMS(OWNER_PHONE, smsBody)
  } catch (err) {
    console.error('[contact] SMS error:', err)
    // Don't fail the request if SMS fails — form submission still succeeds
  }

  return NextResponse.json({ success: true })
}
