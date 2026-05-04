import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPhone } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'
import twilio from 'twilio'
import { getPlanFeatures, type SmsTemplate } from '@/lib/types'
import Link from 'next/link'
import SmsInboxClient, { type ConversationGroup, type MessageItem } from './_components/sms-inbox-client'

export const metadata: Metadata = { title: 'SMS Inbox' }

export default async function SmsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const [{ data: tenant }, { data: templates }] = await Promise.all([
    supabase
      .from('tenants')
      .select('twilio_number, plan_tier')
      .eq('id', profile!.tenant_id)
      .single(),
    supabase
      .from('sms_templates')
      .select('*')
      .eq('tenant_id', profile!.tenant_id)
      .order('sequence_position'),
  ])

  const features = getPlanFeatures((tenant?.plan_tier ?? 1) as 1 | 2 | 3)

  if (!features.hasSMSFollowups) {
    return (
      <div className="card text-center py-20 animate-fade-in">
        <MessageSquare size={36} className="text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg font-600 text-slate-300 mb-2">SMS Inbox requires Plan 2</h2>
        <p className="text-slate-500 text-sm mb-6">Upgrade to Growth to access SMS follow-ups and inbox.</p>
        <Link href="/dashboard/settings/billing" className="btn-primary">Upgrade Now</Link>
      </div>
    )
  }

  if (!tenant?.twilio_number) {
    return (
      <div className="card text-center py-16 animate-fade-in">
        <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-500">No phone number provisioned</p>
        <p className="text-slate-600 text-sm mt-1">Complete onboarding to get your dedicated phone number.</p>
      </div>
    )
  }

  let conversations: ConversationGroup[] = []
  try {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
    const [inbound, outbound] = await Promise.all([
      twilioClient.messages.list({ to: tenant.twilio_number, limit: 200 }),
      twilioClient.messages.list({ from: tenant.twilio_number, limit: 200 }),
    ])
    conversations = groupByContact([...inbound, ...outbound])
  } catch {
    // Twilio creds not configured in dev — show empty state
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">SMS Inbox</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {formatPhone(tenant.twilio_number)} · {conversations.length} conversations
          </p>
        </div>
        <Link href="/dashboard/settings/sms-templates" className="btn-secondary text-sm">
          Edit Templates
        </Link>
      </div>

      <SmsInboxClient conversations={conversations} templates={(templates ?? []) as SmsTemplate[]} />
    </div>
  )
}

function groupByContact(messages: any[]): ConversationGroup[] {
  const map = new Map<string, MessageItem[]>()

  for (const msg of messages) {
    const otherParty = msg.direction === 'inbound' ? msg.from : msg.to
    if (!otherParty) continue
    if (!map.has(otherParty)) map.set(otherParty, [])
    map.get(otherParty)!.push({
      sid: msg.sid,
      body: msg.body ?? '',
      direction: msg.direction ?? 'outbound',
      dateSent: msg.dateSent ?? null,
    })
  }

  return Array.from(map.entries())
    .map(([phone, msgs]) => {
      const sorted = msgs.sort((a, b) =>
        (a.dateSent?.getTime() ?? 0) - (b.dateSent?.getTime() ?? 0)
      )
      return {
        phone,
        messages: sorted,
        lastAt: sorted.at(-1)?.dateSent?.toISOString() ?? new Date().toISOString(),
      }
    })
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
}
