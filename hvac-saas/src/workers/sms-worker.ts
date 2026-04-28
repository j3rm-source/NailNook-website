/**
 * BullMQ worker — runs as a separate Node process, not part of Next.js.
 * Start with: npm run worker
 *
 * Handles two queues:
 *   sms-followup    — send SMS via Twilio
 *   review-request  — send Google review request SMS after job completion
 */

import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'

const redis = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── SMS follow-up worker ──────────────────────────────────────────────────────

const smsWorker = new Worker(
  'sms-followup',
  async (job) => {
    const { tenantId, contactId, to, body } = job.data as {
      tenantId: string
      contactId: string
      to: string
      body: string
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('twilio_number')
      .eq('id', tenantId)
      .single()

    if (!tenant?.twilio_number) {
      throw new Error(`No Twilio number configured for tenant ${tenantId}`)
    }

    await twilioClient.messages.create({ from: tenant.twilio_number, to, body })
    console.log(`[sms-worker] Sent SMS to ${to} (contact ${contactId})`)

    // Mark sequence complete if this is the last message (position 2)
    if (job.name === 'send-sms' && job.opts.delay === undefined) {
      await supabase
        .from('sms_sequences')
        .update({ status: 'completed' })
        .eq('contact_id', contactId)
        .eq('status', 'active')
    }
  },
  { connection: redis, concurrency: 5 }
)

// ── Review request worker ─────────────────────────────────────────────────────

const reviewWorker = new Worker(
  'review-request',
  async (job) => {
    const { tenantId, contactId, contactPhone, businessName, reviewLink } = job.data as {
      tenantId: string
      contactId: string
      contactPhone: string
      businessName: string
      reviewLink: string
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('twilio_number')
      .eq('id', tenantId)
      .single()

    if (!tenant?.twilio_number) {
      throw new Error(`No Twilio number for tenant ${tenantId}`)
    }

    const body = `Hi! Thanks for choosing ${businessName}. If we did a great job, we'd love a quick Google review — it helps us a lot! ${reviewLink}`
    await twilioClient.messages.create({ from: tenant.twilio_number, to: contactPhone, body })
    console.log(`[review-worker] Sent review request to ${contactPhone} (contact ${contactId})`)
  },
  { connection: redis, concurrency: 5 }
)

// ── Lifecycle ─────────────────────────────────────────────────────────────────

smsWorker.on('completed', (job) => console.log(`[sms-worker] Job ${job.id} completed`))
smsWorker.on('failed', (job, err) => console.error(`[sms-worker] Job ${job?.id} failed:`, err))

reviewWorker.on('completed', (job) => console.log(`[review-worker] Job ${job.id} completed`))
reviewWorker.on('failed', (job, err) => console.error(`[review-worker] Job ${job?.id} failed:`, err))

console.log('[workers] SMS + Review workers running...')

process.on('SIGTERM', async () => {
  await smsWorker.close()
  await reviewWorker.close()
  redis.disconnect()
  process.exit(0)
})
