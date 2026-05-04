import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BookingsClient from './_components/bookings-client'

export const metadata: Metadata = { title: 'Bookings' }

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, contact:contacts(first_name, last_name, phone, issue_type)')
    .eq('tenant_id', profile!.tenant_id)
    .order('starts_at', { ascending: false })

  const upcoming = bookings?.filter(b => b.status === 'upcoming') ?? []
  const past = bookings?.filter(b => b.status !== 'upcoming') ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-700 text-white">Bookings</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      <BookingsClient upcoming={upcoming} past={past} />
    </div>
  )
}
