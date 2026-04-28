'use client'

import { useRef, useState } from 'react'
import { MessageSquare, Info } from 'lucide-react'
import type { SmsTemplate } from '@/lib/types'

interface Props {
  templates: SmsTemplate[]
  saveTemplates: (formData: FormData) => Promise<void>
}

const SEQUENCE_INFO = [
  { pos: 0, label: 'Immediate (t+0)',  desc: 'Sent right after a new lead comes in.' },
  { pos: 1, label: '24-Hour Follow-up', desc: 'Sent 24 hours later if they haven\'t booked.' },
  { pos: 2, label: '72-Hour Follow-up', desc: 'Final follow-up 72 hours after the first message.' },
]

const VARS = ['{first_name}', '{business_name}', '{booking_link}', '{issue_type}']

export default function SmsTemplatesClient({ templates, saveTemplates }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const getTemplate = (pos: number) =>
    templates.find(t => t.sequence_position === pos)?.body ?? ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setSaving(true)
    const fd = new FormData(formRef.current)
    await saveTemplates(fd)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function insertVar(textareaId: string, variable: string) {
    const el = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const val = el.value
    el.value = val.slice(0, start) + variable + val.slice(end)
    el.focus()
    el.setSelectionRange(start + variable.length, start + variable.length)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-700 text-white">SMS Templates</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Customize the 3-message follow-up sequence sent to new leads.
        </p>
      </div>

      {/* Variable reference */}
      <div className="card bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-500 text-blue-300 mb-2">Available variables</p>
            <div className="flex flex-wrap gap-2">
              {VARS.map(v => (
                <code key={v} className="text-xs bg-slate-800 text-blue-300 px-2 py-0.5 rounded-md border border-slate-700">
                  {v}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {SEQUENCE_INFO.map(({ pos, label, desc }) => {
          const textareaId = `template_${pos}`
          return (
            <div key={pos} className="card space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="font-600 text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>

              {/* Variable insertion buttons */}
              <div className="flex flex-wrap gap-1.5 pl-11">
                {VARS.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVar(textareaId, v)}
                    className="text-xs px-2 py-1 rounded-lg bg-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors border border-slate-600/50"
                  >
                    {v}
                  </button>
                ))}
              </div>

              <textarea
                id={textareaId}
                name={textareaId}
                defaultValue={getTemplate(pos)}
                rows={4}
                className="input resize-none"
                placeholder={`Write your ${label.toLowerCase()} message...`}
              />
            </div>
          )
        })}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Templates'}
          </button>
          {saved && <span className="text-sm text-green-400">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
