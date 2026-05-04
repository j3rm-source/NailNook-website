import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatPhone } from '@/lib/utils'
import { Phone, Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPlanFeatures } from '@/lib/types'
import TriggerCallButton from './_components/trigger-call-button'
import ActivationGuide from './_components/activation-guide'
import CallAudioPlayer from './_components/call-audio-player'

export const metadata: Metadata = { title: 'AI Calls' }

const OUTCOME_STYLES = {
  booked:          { label: 'Booked',          cls: 'badge-green' },
  follow_up_sent:  { label: 'Follow-up Sent',  cls: 'badge-orange' },
  no_answer:       { label: 'No Answer',        cls: 'badge-gray' },
  other:           { label: 'Other',            cls: 'badge-gray' },
}

export default async function AiCallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const [{ data: calls }, { data: tenant }] = await Promise.all([
    supabase
      .from('ai_calls')
      .select('*, contact:contacts(first_name, last_name, lead_score)')
      .eq('tenant_id', profile!.tenant_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tenants')
      .select('plan_tier, twilio_number')
      .eq('id', profile!.tenant_id)
      .single(),
  ])

  const features = getPlanFeatures((tenant?.plan_tier ?? 1) as 1 | 2 | 3)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">AI Receptionist Calls</h1>
          <p className="text-slate-400 text-sm mt-0.5">{calls?.length ?? 0} calls handled by your AI receptionist</p>
        </div>
        {features.hasAIReceptionist && <TriggerCallButton />}
      </div>

      {features.hasAIReceptionist && tenant?.twilio_number && (
        <ActivationGuide twilioNumber={tenant.twilio_number} />
      )}

      <div className="space-y-3">
        {!calls?.length && (
          <div className="card text-center py-16">
            <Phone size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-500">No AI calls yet</p>
            <p className="text-slate-600 text-sm mt-1">Calls will appear here once your AI receptionist handles them.</p>
          </div>
        )}

        {calls?.map((call) => {
          const outcome = OUTCOME_STYLES[call.outcome as keyof typeof OUTCOME_STYLES]
          return (
            <details key={call.id} className="card group cursor-pointer">
              <summary className="flex items-center gap-4 list-none">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                  <Phone size={17} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-500 text-slate-200">
                    {call.contact
                      ? `${call.contact.first_name} ${call.contact.last_name ?? ''}`
                      : formatPhone(call.caller_phone)}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={11} />{formatDateTime(call.created_at)}
                    </span>
                    {call.duration_seconds && (
                      <span className="text-xs text-slate-600">{Math.round(call.duration_seconds / 60)}m {call.duration_seconds % 60}s</span>
                    )}
                  </div>
                </div>
                {call.contact?.lead_score != null && (
                  <span className={cn('badge text-xs font-600 tabular-nums',
                    call.contact.lead_score >= 7 ? 'badge-green' :
                    call.contact.lead_score >= 4 ? 'badge-orange' : 'badge-red'
                  )}>
                    {call.contact.lead_score}/10
                  </span>
                )}
                <span className={cn('badge', outcome.cls)}>{outcome.label}</span>
              </summary>

              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                <CallAudioPlayer callId={call.bland_call_id} />
                {call.transcript && (
                  <div>
                    <p className="text-xs font-600 uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5">
                      <MessageSquare size={11} /> Transcript
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{call.transcript}</p>
                  </div>
                )}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
