import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import SmsTemplatesClient from './_components/sms-templates-client'

export const metadata: Metadata = { title: 'SMS Templates' }

export default async function SmsTemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: templates } = await supabase
    .from('sms_templates')
    .select('*')
    .eq('tenant_id', profile!.tenant_id)
    .order('sequence_position')

  async function saveTemplates(formData: FormData) {
    'use server'

    const supabaseAdmin = await createAdminClient()
    const { data: { user: u } } = await (await createClient()).auth.getUser()
    const { data: p } = await (await createClient())
      .from('user_profiles').select('tenant_id').eq('id', u!.id).single()

    const positions = [0, 1, 2] as const
    for (const pos of positions) {
      const body = formData.get(`template_${pos}`) as string
      if (!body) continue

      await supabaseAdmin
        .from('sms_templates')
        .upsert(
          { tenant_id: p!.tenant_id, sequence_position: pos, body, delay_hours: pos === 0 ? 0 : pos === 1 ? 24 : 72 },
          { onConflict: 'tenant_id,sequence_position' }
        )
    }

    revalidatePath('/dashboard/settings/sms-templates')
  }

  return (
    <SmsTemplatesClient
      templates={templates ?? []}
      saveTemplates={saveTemplates}
    />
  )
}
