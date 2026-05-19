import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const OWNER_EMAIL = (process.env.OWNER_EMAIL || '').split(',').map(e => e.trim()).filter(Boolean)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'bookings@nailnook.com'

export async function sendOwnerBookingEmail({
  customerName,
  customerPhone,
  customerEmail,
  serviceName,
  staffName,
  date,
  time,
  note,
}: {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  serviceName: string
  staffName: string
  date: string
  time: string
  note?: string | null
}) {
  if (!resend || !OWNER_EMAIL.length) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: OWNER_EMAIL,
    subject: `New Booking — ${customerName} · ${serviceName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 4px;color:#1e1e1e">New Booking Request</h2>
        <p style="margin:0 0 24px;color:#888;font-size:14px">The Nail Nook &amp; More</p>

        <table style="width:100%;border-collapse:collapse;font-size:15px">
          <tr><td style="padding:8px 0;color:#666;width:110px">Customer</td><td style="padding:8px 0;font-weight:600">${customerName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0"><a href="tel:${customerPhone}" style="color:#e91e8c">${customerPhone}</a></td></tr>
          ${customerEmail ? `<tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${customerEmail}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#666">Service</td><td style="padding:8px 0">${serviceName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Specialist</td><td style="padding:8px 0">${staffName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Date</td><td style="padding:8px 0">${date}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0">${time}</td></tr>
          ${note ? `<tr><td style="padding:8px 0;color:#666">Note</td><td style="padding:8px 0">${note}</td></tr>` : ''}
        </table>
      </div>
    `,
  })
}

export async function sendOwnerChatBookingEmail({
  customerName,
  customerPhone,
  serviceName,
  specialistName,
  preferredTime,
}: {
  customerName: string
  customerPhone: string
  serviceName: string
  specialistName: string
  preferredTime: string
}) {
  if (!resend || !OWNER_EMAIL.length) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: OWNER_EMAIL,
    subject: `Chatbot Inquiry — ${customerName} · ${serviceName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 4px;color:#1e1e1e">New Booking Inquiry (via Chatbot)</h2>
        <p style="margin:0 0 24px;color:#888;font-size:14px">The Nail Nook &amp; More</p>

        <table style="width:100%;border-collapse:collapse;font-size:15px">
          <tr><td style="padding:8px 0;color:#666;width:110px">Customer</td><td style="padding:8px 0;font-weight:600">${customerName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0"><a href="tel:${customerPhone}" style="color:#e91e8c">${customerPhone}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666">Service</td><td style="padding:8px 0">${serviceName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Specialist</td><td style="padding:8px 0">${specialistName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Preferred Time</td><td style="padding:8px 0">${preferredTime}</td></tr>
        </table>
      </div>
    `,
  })
}
