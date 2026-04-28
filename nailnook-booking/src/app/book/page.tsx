'use client'
import { useState } from 'react'
import Link from 'next/link'
import '@/styles/marketing.css'

const SERVICES = [
  'Manicure',
  'Pedicure',
  'Acrylic Nails',
  'Gel Extensions',
  'Nail Art',
  'Waxing',
  'Eyelash Extensions',
  'Permanent Makeup',
  'Botox',
  'Massage',
  'Other / Not Sure',
]

type FormState = {
  name: string
  phone: string
  email: string
  service: string
  preferredTime: string
  message: string
}

type Errors = Partial<Record<keyof FormState | 'submit', string>>

export default function BookPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', email: '', service: '', preferredTime: '', message: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function setField(key: keyof FormState, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.phone.trim()) e.phone = 'Phone number is required.'
    else if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit phone number.'
    if (!form.email.trim()) e.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.service) e.service = 'Please select a service.'
    if (!form.preferredTime.trim()) e.preferredTime = 'Preferred date & time is required.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setErrors({ submit: 'Something went wrong. Please call us at (928) 855-6425.' })
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please call us at (928) 855-6425.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mkt">
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="logo">
          <img src="/logo.png" alt="The Nail Nook & More" className="nav-logo-img"/>
        </Link>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/team">Our Team</Link></li>
          <li><Link href="/services#contact">Contact</Link></li>
          <li><Link href="/book" className="nav-cta">Book Now</Link></li>
        </ul>
        <button className="ham" onClick={() => setMenuOpen(o => !o)} aria-label="Open menu">
          <span/><span/><span/>
        </button>
      </nav>
      <div className={`mob-overlay${menuOpen ? ' on' : ''}`} onClick={() => setMenuOpen(false)}/>
      <div className={`mob-menu${menuOpen ? ' on' : ''}`}>
        <button className="mob-close" onClick={() => setMenuOpen(false)}>✕</button>
        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
        <Link href="/team" onClick={() => setMenuOpen(false)}>Our Team</Link>
        <Link href="/services#contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        <Link href="/book" className="btn btn-p" style={{textAlign:'center'}} onClick={() => setMenuOpen(false)}>Book Now</Link>
      </div>

      {/* PAGE HERO */}
      <div className="page-hero">
        <span className="lbl" style={{animation:'mktFadeUp .7s ease both'}}>Reservations</span>
        <h1 className="pg-title" style={{animation:'mktFadeUp .7s .15s ease both'}}>Book an <em>Appointment</em></h1>
        <p className="pg-sub" style={{animation:'mktFadeUp .7s .3s ease both'}}>Fill out the form below and we&apos;ll reach out to confirm your booking as soon as possible.</p>
      </div>

      {/* FORM SECTION */}
      <section className="contact-section">
        {submitted ? (
          <div className="contact-success">
            <div className="contact-success-icon">✓</div>
            <h2>You&apos;re all set!</h2>
            <p>Thank you! The Nail Nook will be in touch with you shortly to confirm your appointment.</p>
            <Link href="/" className="btn btn-p">Back to Home</Link>
          </div>
        ) : (
          <div className="contact-wrap">
            <div className="contact-notice">
              <strong>New Clients — Deposit Required</strong>
              A $20 deposit is required at the time of your appointment to reserve your spot with a specialist.
            </div>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-name">Full Name</label>
                  <input
                    id="cf-name" type="text" className={`form-input${errors.name ? ' err' : ''}`}
                    placeholder="Jane Smith" value={form.name}
                    onChange={e => setField('name', e.target.value)}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-phone">Phone Number</label>
                  <input
                    id="cf-phone" type="tel" className={`form-input${errors.phone ? ' err' : ''}`}
                    placeholder="(928) 555-0100" value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-email">Email Address</label>
                <input
                  id="cf-email" type="email" className={`form-input${errors.email ? ' err' : ''}`}
                  placeholder="jane@example.com" value={form.email}
                  onChange={e => setField('email', e.target.value)}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-service">Service Interested In</label>
                <select
                  id="cf-service" className={`form-select${errors.service ? ' err' : ''}`}
                  value={form.service} onChange={e => setField('service', e.target.value)}
                >
                  <option value="">Select a service…</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.service && <span className="form-error">{errors.service}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-time">Preferred Date &amp; Time</label>
                <input
                  id="cf-time" type="text" className={`form-input${errors.preferredTime ? ' err' : ''}`}
                  placeholder="e.g. Saturday March 15 around 2pm" value={form.preferredTime}
                  onChange={e => setField('preferredTime', e.target.value)}
                />
                {errors.preferredTime && <span className="form-error">{errors.preferredTime}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-message">Message / Notes <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,color:'var(--chl)'}}>(optional)</span></label>
                <textarea
                  id="cf-message" className="form-textarea"
                  placeholder="Any details, questions, or preferences we should know about…"
                  value={form.message} onChange={e => setField('message', e.target.value)}
                />
              </div>

              {errors.submit && (
                <div className="form-submit-error">{errors.submit}</div>
              )}

              <button type="submit" className="btn btn-p contact-submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="f-logo">Nail Nook</div>
            <p className="f-tag">Luxury nail care in the heart of Lake Havasu City. Where beauty meets artistry.</p>
          </div>
          <div>
            <h4>Navigate</h4>
            <ul className="f-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/team">Our Team</Link></li>
              <li><Link href="/book">Book Now</Link></li>
            </ul>
          </div>
          <div>
            <h4>Hours</h4>
            <div className="f-hrs"><p>Mon – Sat: 9 AM – 7 PM<br/>Sunday: 10 AM – 5 PM</p></div>
            <br/>
            <h4>Contact</h4>
            <div className="f-hrs"><p><a href="tel:9288556425" style={{color:'rgba(255,255,255,.7)'}}>(928) 855-6425</a><br/>2120 McCulloch Blvd N, Ste 103<br/>Lake Havasu City, AZ 86403</p></div>
          </div>
        </div>
        <div className="f-bottom">
          <p className="f-copy">© 2024 Nail Nook and More · Lake Havasu City, AZ</p>
          <div className="socials">
            <a href="#" className="soc" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg></a>
            <a href="#" className="soc" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="#" className="soc" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M15 3v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M15 3c0 2.8 2.2 5 5 5"/></svg></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
