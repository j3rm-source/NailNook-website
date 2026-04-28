import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatPhone } from '@/lib/utils'
import { MessageSquare, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import twilio from 'twilio'
import { getPlanFeatures } from '@/lib/types'
import Link from 'next/link'

export const metadata: Metadata = { title: 'SMS Inbox' }

export default async function SmsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('twilio_number, plan_tier')
    .eq('id', profile!.tenant_id)
    .single()

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

  // Fetch message history from Twilio
  let conversations: ConversationGroup[] = []
  try {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
    const messages = await twilioClient.messages.list({
      to: tenant.twilio_number,
      limit: 200,
    })
    const outbound = await twilioClient.messages.list({
      from: tenant.twilio_number,
      limit: 200,
    })

    conversations = groupByContact([...messages, ...outbound])
  } catch {
    // Twilio creds not configured in dev — show empty state
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">SMS Inbox</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {tenant.twilio_number ? formatPhone(tenant.twilio_number) : ''} · {conversations.length} conversations
          </p>
        </div>
        <Link href="/dashboard/settings/sms-templates" className="btn-secondary text-sm">
          Edit Templates
        </Link>
      </div>

      {!conversations.length && (
        <div className="card text-center py-16">
          <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-500">No messages yet</p>
          <p className="text-slate-600 text-sm mt-1">SMS conversations will appear here.</p>
        </div>
      )}

      <div className="space-y-2">
        {conversations.map((conv) => (
          <div key={conv.phone} className="card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700/60 flex items-center justify-center text-sm font-600 text-slate-300">
                {conv.phone.slice(-4)}
              </div>
              <div className="flex-1">
                <p className="font-500 text-slate-200">{formatPhone(conv.phone)}</p>
                <p className="text-xs text-slate-500">{conv.messages.length} messages</p>
              </div>
              <span className="text-xs text-slate-600">{formatDateTime(conv.lastAt)}</span>
            </div>

            <div className="space-y-1.5 pl-12">
              {conv.messages.slice(-3).map((msg) => (
                <div
                  key={msg.sid}
                  className={`flex items-start gap-2 text-sm ${msg.direction === 'inbound' ? 'text-slate-300' : 'text-slate-500'}`}
                >
                  {msg.direction === 'inbound'
                    ? <ArrowDownLeft size={13} className="text-green-400 mt-0.5 shrink-0" />
                    : <ArrowUpRight size={13} className="text-blue-400 mt-0.5 shrink-0" />}
                  <span className="leading-relaxed">{msg.body}</span>
                </div>
              ))}
              {conv.messages.length > 3 && (
                <p className="text-xs text-slate-600 pl-5">+{conv.messages.length - 3} more messages</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

interface MessageItem {
  sid: string
  body: string
  direction: string
  dateSent: Date | null
}

interface ConversationGroup {
  phone: string
  messages: MessageItem[]
  lastAt: string
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
