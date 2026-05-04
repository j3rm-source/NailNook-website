'use client'

import { useState } from 'react'
import { MessageSquare, ArrowUpRight, ArrowDownLeft, Send, Briefcase, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { formatDateTime, formatPhone } from '@/lib/utils'
import type { SmsTemplate } from '@/lib/types'

export interface MessageItem {
  sid: string
  body: string
  direction: string
  dateSent: Date | null
}

export interface ConversationGroup {
  phone: string
  messages: MessageItem[]
  lastAt: string
}

const SEQUENCE_LABELS: Record<number, string> = { 0: 'Immediate', 1: '24h Follow-up', 2: '72h Follow-up' }

interface Props {
  conversations: ConversationGroup[]
  templates: SmsTemplate[]
}

type JobState = { status: 'idle' } | { status: 'loading' } | { status: 'done'; jobId: string; name: string } | { status: 'error'; message: string }

export default function SmsInboxClient({ conversations: initial, templates }: Props) {
  const [conversations, setConversations] = useState(initial)
  const [activeReply, setActiveReply] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobStates, setJobStates] = useState<Record<string, JobState>>({})

  async function sendReply(toPhone: string) {
    const body = replyText.trim()
    if (!body || sending) return
    setSending(true)
    setError(null)
    setReplyText('')

    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toPhone, body }),
    })

    if (res.ok) {
      setConversations(prev => prev.map(conv => {
        if (conv.phone !== toPhone) return conv
        return {
          ...conv,
          messages: [
            ...conv.messages,
            { sid: `local-${Date.now()}`, body, direction: 'outbound-api', dateSent: new Date() },
          ],
          lastAt: new Date().toISOString(),
        }
      }))
    } else {
      setError('Failed to send. Check your Twilio number is configured.')
      setReplyText(body)
    }
    setSending(false)
  }

  async function createJob(phone: string) {
    setJobStates(prev => ({ ...prev, [phone]: { status: 'loading' } }))
    const res = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (res.ok) {
      setJobStates(prev => ({ ...prev, [phone]: { status: 'done', jobId: data.jobId, name: data.contactName } }))
    } else {
      setJobStates(prev => ({ ...prev, [phone]: { status: 'error', message: data.error ?? 'Failed to create job' } }))
    }
  }

  if (!conversations.length) {
    return (
      <div className="card text-center py-16">
        <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-500">No messages yet</p>
        <p className="text-slate-600 text-sm mt-1">SMS conversations will appear here once customers reply.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {conversations.map((conv) => {
        const jobState = jobStates[conv.phone] ?? { status: 'idle' }
        return (
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

              {jobState.status === 'done' ? (
                <a
                  href="/dashboard/jobs"
                  className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <CheckCircle size={13} /> Job created
                </a>
              ) : jobState.status === 'error' ? (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle size={13} /> {jobState.message}
                </span>
              ) : (
                <button
                  onClick={() => createJob(conv.phone)}
                  disabled={jobState.status === 'loading'}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Briefcase size={12} />
                  {jobState.status === 'loading' ? 'Creating…' : 'Create Job'}
                </button>
              )}

              <button
                onClick={() => {
                  setActiveReply(activeReply === conv.phone ? null : conv.phone)
                  setReplyText('')
                }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                {activeReply === conv.phone ? 'Cancel' : 'Reply'}
              </button>
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

            {activeReply === conv.phone && (
              <div className="pl-12 space-y-2 pt-1">
                {templates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setReplyText(t.body)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <ChevronDown size={10} className="-rotate-90" />
                        {SEQUENCE_LABELS[t.sequence_position] ?? `Template ${t.sequence_position + 1}`}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendReply(conv.phone)
                      }
                    }}
                    className="input flex-1 resize-none h-16 text-sm"
                    placeholder="Type a reply… (Enter to send, Shift+Enter for newline)"
                    autoFocus
                  />
                  <button
                    onClick={() => sendReply(conv.phone)}
                    disabled={!replyText.trim() || sending}
                    className="btn-primary px-3 self-end disabled:opacity-40"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
