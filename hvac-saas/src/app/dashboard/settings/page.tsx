import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Globe, MessageSquare, CreditCard, Building2 } from 'lucide-react'
import GeneralSettingsClient from './_components/general-settings-client'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id, full_name').eq('id', user!.id).single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, area_code, twilio_number, google_review_link, calcom_link')
    .eq('id', profile!.tenant_id)
    .single()

  async function saveGeneralSettings(formData: FormData) {
    'use server'

    const supabaseAdmin = await createAdminClient()
    const userClient = await createClient()
    const { data: { user: u } } = await userClient.auth.getUser()
    if (!u) return
    const { data: p } = await userClient
      .from('user_profiles').select('tenant_id').eq('id', u.id).single()
    if (!p) return

    await supabaseAdmin
      .from('tenants')
      .update({
        business_name: formData.get('business_name') as string,
        area_code: formData.get('area_code') as string || null,
        google_review_link: formData.get('google_review_link') as string || null,
        calcom_link: formData.get('calcom_link') as string || null,
      })
      .eq('id', p.tenant_id)

    await supabaseAdmin
      .from('user_profiles')
      .update({ full_name: formData.get('full_name') as string || null })
      .eq('id', u.id)

    revalidatePath('/dashboard/settings')
  }

  const settingsLinks = [
    { href: '/dashboard/settings/website', icon: Globe, label: 'Website', desc: 'Customize your public booking page' },
    { href: '/dashboard/settings/sms-templates', icon: MessageSquare, label: 'SMS Templates', desc: 'Edit your follow-up message sequences' },
    { href: '/dashboard/settings/billing', icon: CreditCard, label: 'Billing', desc: 'Manage your subscription and plan' },
  ]

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-700 text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account and business settings.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3">
        {settingsLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="card card-hover flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="font-600 text-slate-200">{label}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* General settings form */}
      <div>
        <h2 className="text-sm font-600 uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
          <Building2 size={13} /> Business Info
        </h2>
        <GeneralSettingsClient
          tenant={tenant}
          profile={{ full_name: profile?.full_name, email: user?.email }}
          saveGeneralSettings={saveGeneralSettings}
        />
      </div>
    </div>
  )
}
