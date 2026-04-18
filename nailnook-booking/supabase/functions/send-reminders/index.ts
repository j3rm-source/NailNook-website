/**
 * Supabase Edge Function: send-reminders
 *
 * Runs daily (via Supabase cron) at 8am to send 24-hour reminder SMS
 * to customers with confirmed bookings tomorrow.
 *
 * Schedule in Supabase Dashboard → Edge Functions → Cron:
 *   0 8 * * *   (daily at 8am UTC)
 *
 * Or via SQL:
 *   select cron.schedule('send-reminders', '0 8 * * *',
 *     $$select net.http_post(
 *       url := 'https://<project>.supabase.co/functions/v1/send-reminders',
 *       headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
 *     )$$
 *   );
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import twilio from 'https://esm.sh/twilio@5'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const twilioClient = twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID')!,
  Deno.env.get('TWILIO_AUTH_TOKEN')!
)

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

Deno.serve(async (_req) => {
  try {
    const tomorrow = getTomorrow()

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        staff:staff_id (name),
        service:service_id (name)
      `)
      .eq('booking_date', tomorrow)
      .eq('status', 'confirmed')

    if (error) throw error

    const results = await Promise.allSettled(
      (bookings ?? []).map(async (booking: {
        customer_name: string
        customer_phone: string
        booking_time: string
        service: { name: string }
        staff: { name: string }
      }) => {
        const body = `Reminder: You have ${booking.service.name} with ${booking.staff.name} tomorrow at ${formatTime(booking.booking_time)}. Reply CANCEL to cancel.`
        await twilioClient.messages.create({
          from: Deno.env.get('TWILIO_PHONE_NUMBER')!,
          to: booking.customer_phone,
          body,
        })
      })
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return new Response(
      JSON.stringify({ ok: true, sent, failed, date: tomorrow }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
