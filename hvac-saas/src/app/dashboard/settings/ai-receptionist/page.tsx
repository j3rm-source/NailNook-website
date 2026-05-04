import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Bot } from 'lucide-react'
import AiReceptionistClient from './_components/ai-receptionist-client'

export const metadata: Metadata = { title: 'AI Receptionist Settings' }

const VOICES = [
  { value: 'maya',    label: 'Maya (female, warm)' },
  { value: 'ryan',    label: 'Ryan (male, professional)' },
  { value: 'adriana', label: 'Adriana (female, energetic)' },
  { value: 'evelyn',  label: 'Evelyn (female, calm)' },
  { value: 'robbie',  label: 'Robbie (male, friendly)' },
  { value: 'theo',    label: 'Theo (male, confident)' },
]

export default async function AiReceptionistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('ai_voice, ai_greeting, ai_call_hours, ai_transfer_number, business_name, services')
    .eq('id', profile!.tenant_id)
    .single()

  async function save(formData: FormData) {
    'use server'
    const admin = await createAdminClient()
    const userClient = await createClient()
    const { data: { user: u } } = await userClient.auth.getUser()
    if (!u) return
    const { data: p } = await userClient
      .from('user_profiles').select('tenant_id').eq('id', u.id).single()
    if (!p) return

    await admin.from('tenants').update({
      ai_voice:           formData.get('ai_voice') as string || 'maya',
      ai_greeting:        (formData.get('ai_greeting') as string).trim() || null,
      ai_call_hours:      (formData.get('ai_call_hours') as string).trim() || null,
      ai_transfer_number: (formData.get('ai_transfer_number') as string).trim() || null,
    }).eq('id', p.tenant_id)

    revalidatePath('/dashboard/settings/ai-receptionist')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Bot size={18} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-700 text-white">AI Receptionist</h1>
          <p className="text-slate-400 text-sm mt-0.5">Customize how your AI answers missed calls.</p>
        </div>
      </div>

      <AiReceptionistClient tenant={tenant} voices={VOICES} save={save} />
    </div>
  )
}
