'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function IosInstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    let dismissed = false
    try { dismissed = !!localStorage.getItem('pwa-banner-dismissed') } catch {}

    if (isIos && !isStandalone && !dismissed) {
      const t = setTimeout(() => setShow(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    try { localStorage.setItem('pwa-banner-dismissed', '1') } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 16,
        right: 16,
        zIndex: 9999,
        backgroundColor: '#111111',
        border: '1px solid #00d4b8',
        borderRadius: 16,
        padding: '16px 16px 20px',
        boxShadow: '0 8px 40px rgba(0,212,184,0.2)',
        animation: 'fadeIn 0.3s ease forwards',
      }}
    >
      {/* Notch pointing down */}
      <div style={{
        position: 'absolute',
        bottom: -9,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '9px solid transparent',
        borderRight: '9px solid transparent',
        borderTop: '9px solid #00d4b8',
      }} />

      <button
        onClick={dismiss}
        style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
      >
        <X size={16} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <img src="/logo.png" alt="J2 Systems" style={{ height: 36, width: 'auto' }} />
        <div>
          <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, margin: 0 }}>Install J2 Systems</p>
          <p style={{ color: '#888', fontSize: 12, margin: 0 }}>Add to your home screen for quick access</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aaa', fontSize: 13 }}>
        <span>Tap</span>
        {/* iOS share icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        <span>then <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong></span>
      </div>
    </div>
  )
}
