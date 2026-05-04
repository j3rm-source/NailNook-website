import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import TeamClient from './_components/team-client'

export const metadata: Metadata = { title: 'Team' }

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id, role').eq('id', user!.id).single()

  if (profile?.role !== 'owner') {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <p className="text-slate-400 text-sm">Only the account owner can manage team members.</p>
      </div>
    )
  }

  const { data: members } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
          <Users size={18} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-700 text-white">Team</h1>
          <p className="text-slate-400 text-sm mt-0.5">Invite staff members to access your dashboard.</p>
        </div>
      </div>

      <TeamClient members={members ?? []} currentUserId={user!.id} />
    </div>
  )
}
