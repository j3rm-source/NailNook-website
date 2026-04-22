'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '@/styles/marketing.css'

export default function ServicesPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // ---- SCROLL REVEAL ----
    const ro = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.rv').forEach(el => ro.observe(el))

    // ---- PILL ACTIVE STATE ----
    const pills = document.querySelectorAll('.pill')
    const sections = document.querySelectorAll('.svc-section')
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = (e.target as HTMLElement).id
          pills.forEach(p => p.classList.toggle('active', p.getAttribute('href') === '#' + id))
        }
      })
    }, { threshold: 0.4 })
    sections.forEach(s => sio.observe(s))

    // ---- CHATBOT ----
    let chatOpen = false
    const chatTimer = setTimeout(() => {
      if (!chatOpen) {
        document.getElementById('cwin')?.classList.add('on')
        chatOpen = true
      }
    }, 2000)
    function toggleChat() {
      chatOpen = !chatOpen
      document.getElementById('cwin')?.classList.toggle('on', chatOpen)
    }
    function closeChat() {
      chatOpen = false
      document.getElementById('cwin')?.classList.remove('on')
    }
    function botMsg(t: string) {
      const m = document.getElementById('cmsgs')!
      const d = document.createElement('div')
      d.className = 'mb'; d.innerHTML = t
      m.appendChild(d); m.scrollTop = 9999
    }
    function usrMsg(t: string) {
      const m = document.getElementById('cmsgs')!
      const d = document.createElement('div')
      d.className = 'mu'; d.textContent = t
      m.appendChild(d); m.scrollTop = 9999
    }
    function resetQrs() {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = '<button class="qr" onclick="window.__qrSvc(\'book\')">Book Appointment</button><button class="qr" onclick="window.__qrSvc(\'prices\')">Pricing Info</button><button class="qr" onclick="window.__qrSvc(\'hrs\')">Hours & Location</button>'
    }
    function qr(t: string) {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = ''
      if (t === 'book') { usrMsg('Book an appointment'); setTimeout(() => { botMsg('Head over to our <a href="/book">booking page</a>, or call us at <a href="tel:9288556425">(928) 855-6425</a>.'); resetQrs() }, 500) }
      else if (t === 'prices') { usrMsg('Pricing info'); setTimeout(() => { botMsg('Mani from $25 · Pedi from $35 · Acrylic from $55 · Gel from $65 · Dip from $45 · Art from $5 · Waxing from $10. Scroll up to see full menus!'); resetQrs() }, 500) }
      else if (t === 'hrs') { usrMsg('Hours & Location'); setTimeout(() => { botMsg('2120 McCulloch Blvd N, Suite 103, Lake Havasu City, AZ<br>Mon–Sat: 9 AM – 7 PM · Sun: 10 AM – 5 PM<br><a href="tel:9288556425">(928) 855-6425</a>'); resetQrs() }, 500) }
    }
    function sendMsg() {
      const inp = document.getElementById('cinp') as HTMLInputElement
      const t = inp?.value.trim(); if (!t) return
      usrMsg(t); inp.value = ''
      setTimeout(() => { botMsg("For the fastest answer, call us at <a href='tel:9288556425'>(928) 855-6425</a>."); resetQrs() }, 700)
    }

    resetQrs()
    ;(window as any).__qrSvc = qr
    ;(window as any).__toggleChatSvc = toggleChat
    ;(window as any).__closeChatSvc = closeChat
    ;(window as any).__sendMsgSvc = sendMsg

    return () => {
      clearTimeout(chatTimer)
      ro.disconnect()
      sio.disconnect()
      ;['__qrSvc','__toggleChatSvc','__closeChatSvc','__sendMsgSvc'].forEach(k => delete (window as any)[k])
    }
  }, [])

  const Logo = () => (
    <svg viewBox="0 0 28 28" fill="none">
      <rect x="10" y="1" width="8" height="5" rx="2.5" fill="#e91e8c"/>
      <path d="M8 6h12l2.5 20H5.5L8 6z" fill="#f9a8c9"/>
      <path d="M8 6h12l1.2 9H6.8L8 6z" fill="#e91e8c" opacity=".55"/>
      <rect x="9.5" y="2.5" width="9" height="2" rx="1" fill="#c2185b"/>
    </svg>
  )

  return (
    <div className="mkt">
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="logo"><Logo/>Nail Nook</Link>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/team">Our Team</Link></li>
          <li><a href="#contact">Contact</a></li>
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
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <Link href="/book" className="btn btn-p" style={{textAlign:'center'}} onClick={() => setMenuOpen(false)}>Book Now</Link>
      </div>

      {/* PAGE HERO */}
      <div className="page-hero">
        <span className="lbl" style={{animation:'mktFadeUp .7s ease both'}}>Full Service Menu</span>
        <h1 className="pg-title" style={{animation:'mktFadeUp .7s .15s ease both'}}>Services & <em>Pricing</em></h1>
        <p className="pg-sub" style={{animation:'mktFadeUp .7s .3s ease both'}}>Everything you need for stunning nails, all under one roof. Transparent pricing, expert care.</p>
        <div className="pg-stats" style={{animation:'mktFadeUp .7s .45s ease both'}}>
          <div className="pg-stat"><b>14</b><span>Specialists</span></div>
          <div className="pg-stat"><b>7</b><span>Services</span></div>
          <div className="pg-stat"><b>500+</b><span>5-star reviews</span></div>
        </div>
      </div>

      {/* PILL NAV */}
      <div className="svc-pills">
        {[['#manicure','Manicure'],['#pedicure','Pedicure'],['#acrylic','Acrylic'],['#gel','Gel Extensions'],['#dip','Dip Powder'],['#art','Nail Art'],['#waxing','Waxing']].map(([href,label]) => (
          <a key={href} href={href} className="pill">{label}</a>
        ))}
      </div>

      {/* MANICURE */}
      <div className="svc-section" id="manicure">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=700&h=500&fit=crop&auto=format" alt="Manicure" loading="lazy"/>
            <span className="svc-img-label">Manicure</span>
          </div>
          <div>
            <span className="svc-icon-big">01</span>
            <h2 className="svc-title">Manicure</h2>
            <p className="svc-desc">Our manicure services range from a classic shape-and-polish to a full spa experience. All manicures include nail shaping, cuticle care, hand massage, and your choice of polish. Gel options provide up to 3 weeks of chip-free color.</p>
            <table className="price-table">
              <thead><tr><th>Service</th><th>Price</th></tr></thead>
              <tbody>
                <tr><td>Classic Manicure</td><td>$25</td></tr>
                <tr className="pop"><td>Gel Manicure</td><td>$40</td></tr>
                <tr><td>Spa Manicure</td><td>$45</td></tr>
                <tr><td>Gel Removal</td><td>$10</td></tr>
              </tbody>
            </table>
            <p className="price-note">Prices may vary based on nail length and condition.</p>
          </div>
        </div>
      </div>

      {/* PEDICURE */}
      <div className="svc-section" id="pedicure">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=700&h=500&fit=crop&auto=format" alt="Pedicure" loading="lazy"/>
            <span className="svc-img-label">Pedicure</span>
          </div>
          <div>
            <span className="svc-icon-big">02</span>
            <h2 className="svc-title">Pedicure</h2>
            <p className="svc-desc">Treat your feet to the care they deserve. Our pedicure services include foot soak, callus removal, nail shaping, cuticle care, exfoliation, hydrating massage, and polish. Upgrade to a deluxe or spa pedicure for a truly luxurious experience.</p>
            <table className="price-table">
              <thead><tr><th>Service</th><th>Price</th></tr></thead>
              <tbody>
                <tr><td>Classic Pedicure</td><td>$35</td></tr>
                <tr><td>Gel Pedicure</td><td>$50</td></tr>
                <tr className="pop"><td>Spa Pedicure</td><td>$55</td></tr>
                <tr><td>Deluxe Pedicure</td><td>$65</td></tr>
              </tbody>
            </table>
            <p className="price-note">Add-ons available: paraffin wax +$10, callus peel +$8.</p>
          </div>
        </div>
      </div>

      {/* ACRYLIC */}
      <div className="svc-section" id="acrylic">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=700&h=500&fit=crop&q=80&auto=format&sat=-20" alt="Acrylic Nails" loading="lazy"/>
            <span className="svc-img-label">Acrylic Nails</span>
          </div>
          <div>
            <span className="svc-icon-big">03</span>
            <h2 className="svc-title">Acrylic Nails</h2>
            <p className="svc-desc">Acrylic nails offer durability and versatility in one. Whether you want natural-looking extensions or dramatic stilettos, our technicians sculpt to your exact specifications. Includes shaping, filing, and your choice of gel color or polish.</p>
            <table className="price-table">
              <thead><tr><th>Service</th><th>Price</th></tr></thead>
              <tbody>
                <tr className="pop"><td>Full Set</td><td>$55</td></tr>
                <tr><td>Full Set with Tips</td><td>$65</td></tr>
                <tr><td>Fill-In</td><td>$35</td></tr>
                <tr><td>Acrylic Removal</td><td>$15</td></tr>
              </tbody>
            </table>
            <p className="price-note">Nail art, chrome, or complex shapes may incur additional charges.</p>
          </div>
        </div>
      </div>

      {/* GEL EXTENSIONS */}
      <div className="svc-section" id="gel">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1604168177401-9a78da1b4ff6?w=700&h=500&fit=crop&auto=format" alt="Gel Extensions" loading="lazy"/>
            <span className="svc-img-label">Gel Extensions</span>
          </div>
          <div>
            <span className="svc-icon-big">04</span>
            <h2 className="svc-title">Gel Extensions</h2>
            <p className="svc-desc">Gel extensions are the lightweight, flexible alternative to acrylics. They feel more natural and are gentler on your natural nails. Perfect for those who want length and durability without the heaviness of traditional acrylics.</p>
            <table className="price-table">
              <thead><tr><th>Service</th><th>Price</th></tr></thead>
              <tbody>
                <tr className="pop"><td>Full Set</td><td>$65</td></tr>
                <tr><td>Refill</td><td>$45</td></tr>
                <tr><td>Builder Gel Full Set</td><td>$70</td></tr>
                <tr><td>Gel Extension Removal</td><td>$15</td></tr>
              </tbody>
            </table>
            <p className="price-note">Includes gel color polish. Nail art add-ons available.</p>
          </div>
        </div>
      </div>

      {/* DIP POWDER */}
      <div className="svc-section" id="dip">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=700&h=500&fit=crop&auto=format" alt="Dip Powder Nails" loading="lazy"/>
            <span className="svc-img-label">Dip Powder</span>
          </div>
          <div>
            <span className="svc-icon-big">05</span>
            <h2 className="svc-title">Dip Powder</h2>
            <p className="svc-desc">Dip powder nails are odor-free, long-lasting, and available in hundreds of stunning shades. They&apos;re stronger than gel and last up to 4–5 weeks without chipping. No UV lamp needed — just dip, seal, and go.</p>
            <table className="price-table">
              <thead><tr><th>Service</th><th>Price</th></tr></thead>
              <tbody>
                <tr><td>Dip Manicure</td><td>$45</td></tr>
                <tr><td>Dip with Tips</td><td>$55</td></tr>
                <tr><td>Dip Removal</td><td>$12</td></tr>
              </tbody>
            </table>
            <p className="price-note">Available in hundreds of colors. Ombre dip available.</p>
          </div>
        </div>
      </div>

      {/* NAIL ART */}
      <div className="svc-section" id="art">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1632345031435-8727f592d8db?w=700&h=500&fit=crop&auto=format" alt="Nail Art" loading="lazy"/>
            <span className="svc-img-label">Nail Art</span>
          </div>
          <div>
            <span className="svc-icon-big">06</span>
            <h2 className="svc-title">Nail Art</h2>
            <p className="svc-desc">Bring your vision to life with custom nail art. From simple geometric accents to intricate hand-painted florals, chrome powder, rhinestone embellishments, and 3D designs — our artists love a creative challenge.</p>
            <table className="price-table">
              <thead><tr><th>Design Type</th><th>Price</th></tr></thead>
              <tbody>
                <tr><td>Simple Design (per nail)</td><td>$5+</td></tr>
                <tr><td>Complex Art (per nail)</td><td>$15+</td></tr>
                <tr><td>Full Set Nail Art</td><td>$25+</td></tr>
                <tr><td>Chrome / Mirror Powder</td><td>$10+</td></tr>
                <tr><td>Rhinestones / Gems</td><td>$5+</td></tr>
                <tr><td>3D Nail Art</td><td>$20+</td></tr>
              </tbody>
            </table>
            <p className="price-note">Pricing varies by complexity. Consult your specialist for a quote.</p>
          </div>
        </div>
      </div>

      {/* WAXING */}
      <div className="svc-section" id="waxing">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&h=500&fit=crop&auto=format" alt="Waxing Services" loading="lazy"/>
            <span className="svc-img-label">Waxing</span>
          </div>
          <div>
            <span className="svc-icon-big">07</span>
            <h2 className="svc-title">Waxing</h2>
            <p className="svc-desc">Our waxing services deliver smooth, precise results using premium wax formulas gentle on sensitive skin. Perfect for quick touchups or a full facial wax before a big event. All waxing includes soothing aftercare.</p>
            <table className="price-table">
              <thead><tr><th>Area</th><th>Price</th></tr></thead>
              <tbody>
                <tr><td>Eyebrow Wax</td><td>$15</td></tr>
                <tr><td>Lip Wax</td><td>$10</td></tr>
                <tr><td>Chin Wax</td><td>$10</td></tr>
                <tr><td>Full Face Wax</td><td>$35</td></tr>
                <tr><td>Underarm Wax</td><td>$25</td></tr>
                <tr><td>Eyebrow Tint</td><td>$15</td></tr>
              </tbody>
            </table>
            <p className="price-note">All waxing includes soothing aftercare lotion.</p>
          </div>
        </div>
      </div>

      {/* BOOKING STRIP */}
      <div className="booking-strip" id="contact">
        <h2>Ready to Book?</h2>
        <p>Call us directly or use our online booking. We&apos;ll match you with the perfect specialist for your service.</p>
        <Link href="/book" className="btn-w">Book an Appointment</Link>
        &nbsp;&nbsp;
        <a href="tel:9288556425" className="btn-w">Call (928) 855-6425</a>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="f-logo">Nail Nook</div>
            <p className="f-tag">Luxury nail care in Lake Havasu City. Where beauty meets artistry.</p>
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

      {/* CHATBOT */}
      <div className="cw">
        <div className="cwin" id="cwin">
          <div className="ch2">
            <div className="ch2-info">
              <div className="cav">NN</div>
              <div className="ch2-text"><h4>Nail Nook Assistant</h4><span>● Online now</span></div>
            </div>
            <button className="cx" onClick={() => (window as any).__closeChatSvc?.()}>✕</button>
          </div>
          <div className="cmsgs" id="cmsgs">
            <div className="mb">Hi there. Have questions about a service or pricing? I&apos;m happy to help.</div>
          </div>
          <div className="qrs" id="qrs"/>
          <div className="c-inp-area">
            <input type="text" className="c-inp" id="cinp" placeholder="Type a message…"
              onKeyDown={(e) => { if (e.key === 'Enter') (window as any).__sendMsgSvc?.() }}/>
            <button className="c-send" onClick={() => (window as any).__sendMsgSvc?.()}>➤</button>
          </div>
        </div>
        <div className="cb" onClick={() => (window as any).__toggleChatSvc?.()}>
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
        </div>
      </div>
    </div>
  )
}
