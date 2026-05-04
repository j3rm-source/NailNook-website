import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? '')
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@j2systems.io'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://j2systems.io'

// Fire-and-forget — never let email failures break a webhook response
async function send(to: string, subject: string, html: string) {
  try {
    await getResend().emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[email] Failed to send to', to, err)
  }
}

function base(title: string, body: string, ctaUrl?: string, ctaText?: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:Inter,system-ui,sans-serif;color:#ffffff">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="margin-bottom:32px">
      <span style="font-size:20px;font-weight:800;color:#00d4b8;letter-spacing:-0.03em">J2 SYSTEMS</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 20px;color:#ffffff;line-height:1.3">${title}</h1>
    <div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:16px;padding:24px;margin-bottom:24px">
      ${body}
    </div>
    ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;background:#00d4b8;color:#050505;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none">${ctaText ?? 'View Dashboard'}</a>` : ''}
    <p style="color:#333;font-size:12px;margin-top:40px;line-height:1.6">
      You're receiving this because you have a J2 Systems account.<br>
      <a href="${APP_URL}" style="color:#555;text-decoration:underline">j2systems.io</a>
    </p>
  </div>
</body>
</html>`
}

function row(label: string, value: string) {
  return `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1a1a1a">
    <span style="color:#666;font-size:14px">${label}</span>
    <span style="color:#fff;font-size:14px;font-weight:500">${value}</span>
  </div>`
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendNewLeadEmail(opts: {
  to: string
  businessName: string
  contactName: string
  phone: string | null
  source: string
  issueType: string | null
}) {
  const sourceLabel: Record<string, string> = {
    ai_call: 'AI Receptionist Call',
    website_form: 'Website Contact Form',
    sms_reply: 'SMS Reply',
    manual: 'Manual Entry',
    cal_booking: 'Cal.com Booking',
  }

  const body = `
    <p style="color:#aaa;font-size:14px;margin:0 0 16px">You have a new lead from <strong style="color:#00d4b8">${sourceLabel[opts.source] ?? opts.source}</strong>.</p>
    ${row('Name', opts.contactName)}
    ${opts.phone ? row('Phone', opts.phone) : ''}
    ${opts.issueType ? row('Service Needed', opts.issueType) : ''}
    ${row('Source', sourceLabel[opts.source] ?? opts.source)}
  `

  await send(
    opts.to,
    `New lead: ${opts.contactName} — ${opts.businessName}`,
    base(`New lead for ${opts.businessName}`, body, `${APP_URL}/dashboard/contacts`, 'View in CRM')
  )
}

export async function sendBookingConfirmationEmail(opts: {
  to: string
  businessName: string
  contactName: string
  startsAt: string
  jobTitle: string
}) {
  const date = new Date(opts.startsAt).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })

  const body = `
    <p style="color:#aaa;font-size:14px;margin:0 0 16px">A new booking has been confirmed for <strong style="color:#fff">${opts.businessName}</strong>.</p>
    ${row('Customer', opts.contactName)}
    ${row('Job', opts.jobTitle)}
    ${row('Date & Time', date)}
  `

  await send(
    opts.to,
    `Booking confirmed: ${opts.contactName} — ${date}`,
    base('New Booking Confirmed', body, `${APP_URL}/dashboard/bookings`, 'View Bookings')
  )
}

export async function sendWelcomeEmail(opts: { to: string; name: string }) {
  const firstName = opts.name?.split(' ')[0] ?? 'there'

  const body = `
    <p style="color:#aaa;font-size:14px;margin:0 0 16px">Your J2 Systems account is ready. Here's what to do next:</p>
    <div style="space-y:12px">
      <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #1a1a1a">
        <span style="background:#00d4b8;color:#050505;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">1</span>
        <div><p style="margin:0;color:#fff;font-size:14px;font-weight:600">Complete your profile</p><p style="margin:4px 0 0;color:#666;font-size:13px">Add your business name, services, and area code.</p></div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #1a1a1a">
        <span style="background:#00d4b8;color:#050505;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">2</span>
        <div><p style="margin:0;color:#fff;font-size:14px;font-weight:600">Set up call forwarding</p><p style="margin:4px 0 0;color:#666;font-size:13px">Forward your missed calls to your AI receptionist number.</p></div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0">
        <span style="background:#00d4b8;color:#050505;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">3</span>
        <div><p style="margin:0;color:#fff;font-size:14px;font-weight:600">Share your booking page</p><p style="margin:4px 0 0;color:#666;font-size:13px">Your website is live — share the link with customers.</p></div>
      </div>
    </div>
  `

  await send(
    opts.to,
    `Welcome to J2 Systems, ${firstName}!`,
    base(`Welcome, ${firstName}! 🎉`, body, `${APP_URL}/onboarding`, 'Complete Setup')
  )
}
