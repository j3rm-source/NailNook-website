import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import WebsiteSettingsClient from './_components/website-settings-client'

export const metadata: Metadata = { title: 'Website Settings' }

export default async function WebsiteSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, tagline, primary_color, logo_url, services, about_text, google_review_link, website_slug')
    .eq('id', profile!.tenant_id)
    .single()

  async function saveWebsiteSettings(formData: FormData) {
    'use server'

    const supabaseAdmin = await createAdminClient()
    const userClient = await createClient()
    const { data: { user: u } } = await userClient.auth.getUser()
    if (!u) return
    const { data: p } = await userClient
      .from('user_profiles').select('tenant_id').eq('id', u.id).single()
    if (!p) return

    const servicesRaw = formData.get('services') as string
    const services = servicesRaw
      ? servicesRaw.split('\n').map(s => s.trim()).filter(Boolean)
      : []

    await supabaseAdmin
      .from('tenants')
      .update({
        business_name: formData.get('business_name') as string,
        tagline: formData.get('tagline') as string || null,
        primary_color: formData.get('primary_color') as string || '#2563eb',
        about_text: formData.get('about_text') as string || null,
        google_review_link: formData.get('google_review_link') as string || null,
        website_slug: (formData.get('website_slug') as string || '')
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-{2,}/g, '-')
          .replace(/^-+|-+$/g, ''),
        services,
      })
      .eq('id', p.tenant_id)

    revalidatePath('/dashboard/settings/website')
    revalidatePath('/dashboard/website')
  }

  return <WebsiteSettingsClient tenant={tenant} saveWebsiteSettings={saveWebsiteSettings} />
}
