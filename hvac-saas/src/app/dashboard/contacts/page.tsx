import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ContactsClient from './_components/contacts-client'

export const metadata: Metadata = { title: 'Contacts' }

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('tenant_id', profile!.tenant_id)
    .order('created_at', { ascending: false })

  return <ContactsClient initialContacts={contacts ?? []} tenantId={profile!.tenant_id} />
}
