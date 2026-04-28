import { smsQueue } from './queue'
import { createAdminClient } from './supabase/server'
import { interpolateSmsTemplate } from './utils'

const SEQUENCE_DELAYS_MS = [
  0,                        // t+0  immediate
  24 * 60 * 60 * 1000,      // t+24hr
  72 * 60 * 60 * 1000,      // t+72hr
]

export interface SmsSequencePayload {
  tenantId: string
  contactId: string
  contactPhone: string
  templateVars: Record<string, string>
}

/**
 * Start a 3-message SMS follow-up sequence for a contact.
 * Returns the BullMQ job IDs so they can be cancelled later.
 */
export async function startSmsSequence(payload: SmsSequencePayload): Promise<string[]> {
  const supabase = await createAdminClient()

  // Fetch templates for this tenant
  const { data: templates } = await supabase
    .from('sms_templates')
    .select('*')
    .eq('tenant_id', payload.tenantId)
    .order('sequence_position')

  if (!templates || templates.length === 0) return []

  const jobIds: string[] = []

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i]
    const delay = SEQUENCE_DELAYS_MS[i] ?? 0
    const body = interpolateSmsTemplate(template.body, payload.templateVars)

    const job = await smsQueue.add(
      'send-sms',
      {
        tenantId: payload.tenantId,
        contactId: payload.contactId,
        to: payload.contactPhone,
        body,
      },
      { delay, attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
    )

    jobIds.push(job.id!)
  }

  // Record the sequence in DB
  await supabase.from('sms_sequences').insert({
    tenant_id: payload.tenantId,
    contact_id: payload.contactId,
    bullmq_job_ids: jobIds,
    status: 'active',
  })

  return jobIds
}

/**
 * Cancel all pending SMS jobs for a contact (e.g. when they book).
 */
export async function cancelSmsSequence(contactId: string): Promise<void> {
  const supabase = await createAdminClient()

  const { data: sequences } = await supabase
    .from('sms_sequences')
    .select('id, bullmq_job_ids')
    .eq('contact_id', contactId)
    .eq('status', 'active')

  if (!sequences) return

  for (const seq of sequences) {
    for (const jobId of seq.bullmq_job_ids) {
      try {
        const job = await smsQueue.getJob(jobId)
        await job?.remove()
      } catch {
        // Job may have already fired — ignore
      }
    }

    await supabase
      .from('sms_sequences')
      .update({ status: 'cancelled' })
      .eq('id', seq.id)
  }
}
