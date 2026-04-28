import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from './_components/onboarding-wizard'

export const metadata: Metadata = { title: 'Set Up Your Account' }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()

  if (!profile) redirect('/signup/plan')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, business_name, area_code, services, twilio_number, website_slug')
    .eq('id', profile.tenant_id)
    .single()

  return <OnboardingWizard tenant={tenant} />
}
