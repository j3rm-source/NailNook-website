import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

let _resend: Resend | null = null
const getResend = () => _resend ??= new Resend(process.env.RESEND_API_KEY ?? '')

export async function POST(request: NextRequest) {
  // Admin-only: verify email matches ADMIN_EMAIL
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { subject, message } = await request.json() as { subject: string; message: string }
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'subject and message required' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Fetch all active tenant owner emails
  const { data: profiles } = await admin
    .from('user_profiles')
    .select('email, tenant_id, tenants!inner(stripe_subscription_status)')
    .eq('role', 'owner')
    .eq('tenants.stripe_subscription_status', 'active')

  if (!profiles?.length) {
    return NextResponse.json({ sent: 0 })
  }

  const emails = profiles.map(p => p.email).filter(Boolean)
  const safeMessage = message.trim()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Send in batches of 50 (Resend limit per batch call)
  let sent = 0
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50)
    await getResend().batch.send(
      batch.map(to => ({
        from: `J2 Systems <noreply@${process.env.RESEND_DOMAIN ?? 'mail.tradedesk.io'}>`,
        to,
        subject: subject.trim(),
        text: message.trim(),
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px"><p style="white-space:pre-wrap;line-height:1.6">${safeMessage.replace(/\n/g, '<br>')}</p><hr style="margin:24px 0;border:none;border-top:1px solid #eee"><p style="color:#999;font-size:12px">J2 Systems · <a href="https://tradedesk.io/dashboard/settings/billing" style="color:#999">Manage subscription</a></p></div>`,
      }))
    )
    sent += batch.length
  }

  return NextResponse.json({ sent })
}
