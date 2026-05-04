import { publishDelayed, cancelMessage } from './qstash'
import { createAdminClient } from './supabase/server'
import { interpolateSmsTemplate } from './utils'

export interface SmsSequencePayload {
  tenantId: string
  contactId: string
  contactPhone: string
  templateVars: Record<string, string>
}

export async function startSmsSequence(payload: SmsSequencePayload): Promise<string[]> {
  const supabase = await createAdminClient()

  // Cancel any existing active sequence for this contact before starting a new one
  await cancelSmsSequence(payload.contactId)

  const { data: templates } = await supabase
    .from('sms_templates')
    .select('*')
    .eq('tenant_id', payload.tenantId)
    .order('sequence_position')

  if (!templates || templates.length === 0) return []

  const messageIds: string[] = []

  for (const template of templates) {
    const body = interpolateSmsTemplate(template.body, payload.templateVars)
    const messageId = await publishDelayed(
      '/api/qstash/sms-followup',
      { tenantId: payload.tenantId, contactId: payload.contactId, to: payload.contactPhone, body },
      template.delay_hours * 3600
    )
    messageIds.push(messageId)
  }

  await supabase.from('sms_sequences').insert({
    tenant_id: payload.tenantId,
    contact_id: payload.contactId,
    qstash_message_ids: messageIds,
    status: 'active',
  })

  return messageIds
}

export async function cancelSmsSequence(contactId: string): Promise<void> {
  const supabase = await createAdminClient()

  const { data: sequences } = await supabase
    .from('sms_sequences')
    .select('id, qstash_message_ids')
    .eq('contact_id', contactId)
    .eq('status', 'active')

  if (!sequences) return

  for (const seq of sequences) {
    for (const messageId of seq.qstash_message_ids) {
      await cancelMessage(messageId)
    }

    await supabase
      .from('sms_sequences')
      .update({ status: 'cancelled' })
      .eq('id', seq.id)
  }
}
