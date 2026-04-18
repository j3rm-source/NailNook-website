import twilio from 'twilio'

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured')
  }
  return twilio(accountSid, authToken)
}

export async function sendSMS(to: string, body: string): Promise<void> {
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!from) throw new Error('TWILIO_PHONE_NUMBER is not set')

  // Skip in development if no credentials provided
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC_PLACEHOLDER')
  ) {
    console.log(`[SMS DEV] To: ${to}\n${body}`)
    return
  }

  const client = getClient()
  await client.messages.create({ from, to, body })
}

export function buildBookingConfirmationStaffSMS(
  customerName: string,
  serviceName: string,
  date: string,
  time: string
): string {
  return `📅 New booking! ${customerName} booked ${serviceName} on ${date} at ${time}. Check your dashboard for details.`
}

export function buildBookingConfirmationCustomerSMS(
  customerName: string,
  serviceName: string,
  staffName: string,
  date: string,
  time: string
): string {
  return `Hi ${customerName}! Your ${serviceName} appointment with ${staffName} is confirmed for ${date} at ${time}. Reply CANCEL to cancel.`
}

export function buildCancellationCustomerSMS(
  date: string,
  time: string,
  businessUrl: string
): string {
  return `Your appointment on ${date} at ${time} has been cancelled. Book again at ${businessUrl}`
}

export function buildCancellationStaffSMS(
  customerName: string,
  date: string,
  time: string
): string {
  return `Booking cancelled: ${customerName} on ${date} at ${time}.`
}

export function buildReminderCustomerSMS(
  customerName: string,
  serviceName: string,
  staffName: string,
  time: string
): string {
  return `Reminder: You have ${serviceName} with ${staffName} tomorrow at ${time}. Reply CANCEL to cancel.`
}
