import { publishDelayed, cancelMessage } from './qstash'
import { createAdminClient } from './supabase/server'
import { interpolateSmsTemplate } from './utils'

const SEQUENCE_DELAYS_S = [
  0,                  // t+0  immediate
  24 * 60 * 60,       // t+24hr
  72 * 60 * 60,       // t+72hr
]

export interface SmsSequencePayload {
  tenantId: string
  contactId: string
  contactPhone: string
  templateVars: Record<string, string>
}

export async function startSmsSequence(payload: SmsSequencePayload): Promise<string[]> {
  const supabase = await createAdminClient()

  const { data: templates } = await supabase
    .from('sms_templates')
    .select('*')
    .eq('tenant_id', payload.tenantId)
    .order('sequence_position')

  if (!templates || templates.length === 0) return []

  const messageIds: string[] = []

  for (let i = 0; i < templates.length; i++) {
    const body = interpolateSmsTemplate(templates[i].body, payload.templateVars)
    const messageId = await publishDelayed(
      '/api/qstash/sms-followup',
      { tenantId: payload.tenantId, contactId: payload.contactId, to: payload.contactPhone, body },
      SEQUENCE_DELAYS_S[i] ?? 0
    )
    messageIds.push(messageId)
  }

  await supabase.from('sms_sequences').insert({
    tenant_id: payload.tenantId,
    contact_id: payload.contactId,
    bullmq_job_ids: messageIds,
    status: 'active',
  })

  return messageIds
}

export async function cancelSmsSequence(contactId: string): Promise<void> {
  const supabase = await createAdminClient()

  const { data: sequences } = await supabase
    .from('sms_sequences')
    .select('id, bullmq_job_ids')
    .eq('contact_id', contactId)
    .eq('status', 'active')

  if (!sequences) return

  for (const seq of sequences) {
    for (const messageId of seq.bullmq_job_ids) {
      await cancelMessage(messageId)
    }

    await supabase
      .from('sms_sequences')
      .update({ status: 'cancelled' })
      .eq('id', seq.id)
  }
}
