'use client'

import { useState } from 'react'
import { Phone, ChevronDown, ChevronUp, CheckCircle2, Copy } from 'lucide-react'

const CARRIERS = [
  {
    name: 'AT&T',
    steps: [
      'Open your phone dialer',
      'Dial *72 followed by your J2 number (e.g. *72+15551234567)',
      'Press Call — you\'ll hear a confirmation tone',
      'Hang up. Forwarding is active.',
      'To cancel: dial *73 and press Call',
    ],
  },
  {
    name: 'Verizon',
    steps: [
      'Open your phone dialer',
      'Dial *71 followed by your J2 number (e.g. *71+15551234567)',
      'Press Call — you\'ll hear two beeps confirming it\'s set',
      'To cancel: dial *71 and press Call',
    ],
  },
  {
    name: 'T-Mobile',
    steps: [
      'Open your phone dialer',
      'Dial **61*+15551234567# (replace with your J2 number)',
      'Press Call',
      'To cancel: dial ##61# and press Call',
    ],
  },
  {
    name: 'iPhone (any carrier)',
    steps: [
      'Go to Settings → Phone → Call Forwarding',
      'Toggle "Call Forwarding" ON',
      'Tap "Forward To" and enter your J2 number',
      'Note: On iPhone, set forwarding to trigger after 20 seconds (no-answer)',
    ],
  },
  {
    name: 'Android (any carrier)',
    steps: [
      'Open the Phone app → tap ⋮ Menu → Settings',
      'Tap Calls → Call Forwarding → Forward When Unanswered',
      'Enter your J2 number and tap Enable',
    ],
  },
]

interface Props {
  twilioNumber: string
}

export default function ActivationGuide({ twilioNumber }: Props) {
  const [open, setOpen] = useState(false)
  const [activeCarrier, setActiveCarrier] = useState(0)
  const [copied, setCopied] = useState(false)

  function copyNumber() {
    navigator.clipboard.writeText(twilioNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-blue-500/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
          <Phone size={18} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="font-600 text-white">Activate Your AI Receptionist</p>
          <p className="text-sm text-slate-400 mt-0.5">
            Set up call forwarding so missed calls reach your AI. Takes 2 minutes.
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-blue-500/20">
          {/* Step 1 — Your number */}
          <div className="pt-4">
            <p className="text-xs font-600 uppercase tracking-widest text-slate-500 mb-3">
              Step 1 — Your dedicated number
            </p>
            <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700">
              <Phone size={15} className="text-blue-400 shrink-0" />
              <span className="font-mono font-600 text-white text-lg flex-1">{twilioNumber}</span>
              <button
                onClick={copyNumber}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <CheckCircle2 size={13} className="text-green-400" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Forward your missed calls to this number. The AI will call back within seconds.
            </p>
          </div>

          {/* Step 2 — Carrier instructions */}
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-slate-500 mb-3">
              Step 2 — Set up call forwarding
            </p>
            <div className="flex gap-2 flex-wrap mb-4">
              {CARRIERS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setActiveCarrier(i)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-500 transition-colors ${
                    activeCarrier === i
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <ol className="space-y-2">
              {CARRIERS[activeCarrier].steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-700 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-slate-300 leading-relaxed">{step.replace(/\+15551234567/g, twilioNumber)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Step 3 — Test it */}
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
            <p className="text-sm font-600 text-green-300 mb-1 flex items-center gap-2">
              <CheckCircle2 size={14} /> Step 3 — Test it
            </p>
            <p className="text-sm text-slate-400">
              Call your business number from another phone and don't answer. Your AI receptionist should call back within 10 seconds. The call will then appear in this page.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
