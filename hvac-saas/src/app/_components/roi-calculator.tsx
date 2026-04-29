'use client'

import { useState } from 'react'
import { formatCurrencyCompact } from '@/lib/utils'

export default function RoiCalculator() {
  const [missedCalls, setMissedCalls] = useState(12)
  const [jobValue, setJobValue] = useState(450)

  const weeklyLost = missedCalls * jobValue
  const annualLost = weeklyLost * 52
  const recovered = Math.round(annualLost * 0.52)

  return (
    <section style={{ backgroundColor: '#080808', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
      <div className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-center text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--brand-500)' }}>
          Revenue Calculator
        </p>
        <h2 className="text-4xl md:text-5xl font-800 text-center mb-3" style={{ letterSpacing: '-0.03em' }}>
          Calculate your{' '}
          <span style={{ color: 'var(--brand-500)' }}>hidden losses</span>
        </h2>
        <p className="text-center mb-14" style={{ color: '#666' }}>
          These numbers are based on real averages across HVAC and plumbing businesses.
        </p>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Inputs */}
          <div className="space-y-10">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-700 uppercase tracking-widest" style={{ color: '#888' }}>
                  Missed calls per week
                </p>
                <span className="text-2xl font-800" style={{ color: 'var(--brand-500)' }}>{missedCalls}</span>
              </div>
              <input
                type="range"
                min={1} max={50}
                value={missedCalls}
                onChange={e => setMissedCalls(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#444' }}>
                <span>1</span><span>50</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-700 uppercase tracking-widest" style={{ color: '#888' }}>
                  Average job value
                </p>
                <span className="text-2xl font-800" style={{ color: 'var(--brand-500)' }}>${jobValue}</span>
              </div>
              <input
                type="range"
                min={100} max={2000} step={50}
                value={jobValue}
                onChange={e => setJobValue(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#444' }}>
                <span>$100</span><span>$2,000</span>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-2xl p-8 space-y-6" style={{ backgroundColor: '#0d0d0d', border: '1px solid #1e1e1e' }}>
            <div className="flex items-start justify-between pb-5" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div>
                <p className="text-xs font-600 uppercase tracking-wider mb-1" style={{ color: '#555' }}>Weekly lost revenue</p>
                <p className="text-3xl font-800 text-white">{formatCurrencyCompact(weeklyLost)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-600 uppercase tracking-wider mb-1" style={{ color: '#555' }}>Annual lost revenue</p>
                <p className="text-3xl font-800 text-white">{formatCurrencyCompact(annualLost)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-600 uppercase tracking-wider mb-2" style={{ color: 'var(--brand-500)' }}>What J2 Systems recovers</p>
              <p className="text-5xl font-800 mb-1" style={{ color: 'var(--brand-500)' }}>
                {formatCurrencyCompact(recovered)}
                <span className="text-lg font-400 ml-1" style={{ color: 'var(--brand-600)' }}>/yr</span>
              </p>
              <p className="text-xs" style={{ color: '#555' }}>Based on 52% average conversion of captured leads</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
