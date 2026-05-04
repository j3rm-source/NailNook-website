'use client'

import { useState } from 'react'
import { UserPlus, Trash2, Mail, ShieldCheck, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { UserProfile } from '@/lib/types'

interface Props {
  members: UserProfile[]
  currentUserId: string
}

export default function TeamClient({ members: initial, currentUserId }: Props) {
  const [members, setMembers] = useState<UserProfile[]>(initial)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleInvite(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setInviteError('')
    setInviteSent(false)
    setInviting(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? 'Failed to send invite')
      } else {
        setInviteSent(true)
        setEmail('')
        // Optimistically add a pending member row
        setMembers(prev => [...prev, {
          id: `pending-${Date.now()}`,
          tenant_id: '',
          email,
          full_name: null,
          role: 'staff',
          created_at: new Date().toISOString(),
        }])
      }
    } catch {
      setInviteError('Network error — please try again.')
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(id: string) {
    setRemoving(id)
    try {
      const res = await fetch(`/api/team/member/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id))
      }
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="card space-y-4">
        <h2 className="text-sm font-600 text-slate-300">Invite Team Member</h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <div className="relative flex-1">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@email.com"
              className="input pl-9"
              required
            />
          </div>
          <button type="submit" disabled={inviting} className="btn-primary gap-2 shrink-0">
            <UserPlus size={15} />
            {inviting ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
        {inviteError && <p className="text-sm text-red-400">{inviteError}</p>}
        {inviteSent && <p className="text-sm text-green-400">Invite sent! They&apos;ll receive an email to set up their account.</p>}
        <p className="text-xs text-slate-600">Staff members can view and manage contacts, jobs, and bookings. Only owners can change billing or settings.</p>
      </div>

      {/* Member list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/60">
          <h2 className="text-sm font-600 text-slate-300">Team Members</h2>
        </div>
        <ul className="divide-y divide-slate-700/30">
          {members.map(member => (
            <li key={member.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                {member.role === 'owner'
                  ? <ShieldCheck size={16} className="text-teal-400" />
                  : <User size={16} className="text-slate-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-slate-200 truncate">
                  {member.full_name ?? member.email}
                </p>
                {member.full_name && (
                  <p className="text-xs text-slate-500 truncate">{member.email}</p>
                )}
                <p className="text-xs text-slate-600 mt-0.5">
                  {member.role === 'owner' ? 'Owner' : 'Staff'} · Joined {formatDate(member.created_at)}
                </p>
              </div>
              {member.role !== 'owner' && member.id !== currentUserId && (
                <button
                  onClick={() => handleRemove(member.id)}
                  disabled={removing === member.id}
                  className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  title="Remove member"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
