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
      if (!chatOpen && !sessionStorage.getItem('chatDismissed')) {
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
      sessionStorage.setItem('chatDismissed', '1')
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
    const TEAM_SVC: [string, string][] = [
      ['Stephanie','Owner / Nail Tech'],
      ['Raquel','Nail Tech'],
      ['Kattie','Nail Tech'],
      ['Shannon','Nail Tech'],
      ['Ricci','Hair Specialist'],
      ['Lara','Massage Therapist'],
      ['Shelby','Waxing Specialist'],
      ['Ashley','Eyelash Specialist'],
    ]

    function resetQrs() {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = '<button class="qr" onclick="window.__qrSvc(\'book\')">Book Appointment</button><button class="qr" onclick="window.__qrSvc(\'hrs\')">Hours & Location</button>'
    }
    function setQrsSvc(html: string) {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = html
    }
    function startBookingSvc() {
      botMsg("Are you ready to book, need a little help choosing, or would you like to pick a specific team member?")
      setQrsSvc('<button class="qr" onclick="window.__svcReady()">I\'m ready to book</button><button class="qr" onclick="window.__svcHelp()">I need help choosing</button><button class="qr" onclick="window.__svcTeamPicker()">Choose a team member</button>')
    }
    function svcReady() {
      usrMsg("I'm ready to book"); setQrsSvc('')
      setTimeout(() => {
        botMsg("Would you like me to walk you through it, or fill out the form yourself?")
        setQrsSvc('<button class="qr" onclick="window.__svcForm()">Take me to the form</button><button class="qr" onclick="window.__svcTeamPicker()">Choose a team member first</button>')
      }, 450)
    }
    function svcHelp() {
      usrMsg("I need help choosing"); setQrsSvc('')
      setTimeout(() => {
        botMsg("No problem! Scroll up to browse our services, or head to the <a href='/team'>team page</a> to find the right specialist. Ready to book when you are!")
        setQrsSvc('<button class="qr" onclick="window.__svcReady()">I\'m ready to book</button>')
      }, 450)
    }
    function svcTeamPicker() {
      usrMsg("Choose a team member"); setQrsSvc('')
      setTimeout(() => {
        botMsg("Who would you like to book with? I'll take you to the booking form.")
        setQrsSvc(TEAM_SVC.map(([name, role]) => `<button class="qr" onclick="window.__svcPickSpec('${name}')">${name} — ${role}</button>`).join(''))
      }, 450)
    }
    function svcPickSpec(name: string) {
      usrMsg(name); setQrsSvc('')
      setTimeout(() => { botMsg(`Head to our <a href="/book">booking form</a> and select ${name} as your specialist — we'll take care of the rest!`); resetQrs() }, 450)
    }
    function svcForm() {
      usrMsg("Take me to the form"); setQrsSvc('')
      setTimeout(() => { botMsg('Head over to our <a href="/book">booking page</a> to get started!'); resetQrs() }, 450)
    }
    function qr(t: string) {
      setQrsSvc('')
      if (t === 'book') { usrMsg('Book an appointment'); setTimeout(startBookingSvc, 500) }
      else if (t === 'hrs') { usrMsg('Hours & Location'); setTimeout(() => { botMsg('2120 McCulloch Blvd N, Suite 103, Lake Havasu City, AZ<br>Mon–Sat: 9 AM – 7 PM · Sun: 10 AM – 5 PM<br><a href="tel:9284863524">(928) 486-3524</a>'); resetQrs() }, 500) }
    }
    function sendMsg() {
      const inp = document.getElementById('cinp') as HTMLInputElement
      const t = inp?.value.trim(); if (!t) return
      usrMsg(t); inp.value = ''
      setTimeout(() => { botMsg("For the fastest answer, call us at <a href='tel:9284863524'>(928) 486-3524</a>."); resetQrs() }, 700)
    }

    resetQrs()
    ;(window as any).__qrSvc = qr
    ;(window as any).__svcReady = svcReady
    ;(window as any).__svcHelp = svcHelp
    ;(window as any).__svcTeamPicker = svcTeamPicker
    ;(window as any).__svcPickSpec = svcPickSpec
    ;(window as any).__svcForm = svcForm
    ;(window as any).__toggleChatSvc = toggleChat
    ;(window as any).__closeChatSvc = closeChat
    ;(window as any).__sendMsgSvc = sendMsg

    return () => {
      clearTimeout(chatTimer)
      ro.disconnect()
      sio.disconnect()
      ;['__qrSvc','__svcReady','__svcHelp','__svcTeamPicker','__svcPickSpec','__svcForm','__toggleChatSvc','__closeChatSvc','__sendMsgSvc'].forEach(k => delete (window as any)[k])
    }
  }, [])


  return (
    <div className="mkt">
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="logo"><img src="/the nail nook logo.png" alt="The Nail Nook & More" className="nav-logo-img"/></Link>
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
        <h1 className="pg-title" style={{animation:'mktFadeUp .7s .15s ease both'}}>Our <em>Services</em></h1>
        <p className="pg-sub" style={{animation:'mktFadeUp .7s .3s ease both'}}>Everything you need for stunning nails, all under one roof, with expert care.</p>
        <div className="pg-stats" style={{animation:'mktFadeUp .7s .45s ease both'}}>
          <div className="pg-stat"><b>10</b><span>Services</span></div>
          <div className="pg-stat"><b>100+</b><span>5-star reviews</span></div>
        </div>
      </div>

      {/* PILL NAV */}
      <div className="svc-pills">
        {[['#manicure','Manicure'],['#pedicure','Pedicure'],['#acrylic','Acrylic'],['#gel','Gel Extensions'],['#art','Nail Art'],['#waxing','Waxing'],['#lashes','Lash Extensions'],['#permmakeup','Perm. Makeup'],['#botox','Botox'],['#massage','Massage']].map(([href,label]) => (
          <a key={href} href={href} className="pill">{label}</a>
        ))}
      </div>

      {/* MANICURE */}
      <div className="svc-section" id="manicure">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="/team/shannon/mainicure.png.jpg" alt="Manicure" loading="lazy"/>
            <span className="svc-img-label">Manicure</span>
          </div>
          <div>
            <span className="svc-icon-big">01</span>
            <h2 className="svc-title">Manicure</h2>
            <p className="svc-desc">Our manicure services range from a classic shape-and-polish to a full spa experience. All manicures include nail shaping, cuticle care, hand massage, and your choice of polish. Gel options provide up to 3 weeks of chip-free color.</p>
          </div>
        </div>
      </div>

      {/* PEDICURE */}
      <div className="svc-section" id="pedicure">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=700&h=500&fit=crop&auto=format" alt="Pedicure" loading="lazy"/>
            <span className="svc-img-label">Pedicure</span>
          </div>
          <div>
            <span className="svc-icon-big">02</span>
            <h2 className="svc-title">Pedicure</h2>
            <p className="svc-desc">Treat your feet to the care they deserve. Our pedicure services include foot soak, callus removal, nail shaping, cuticle care, exfoliation, hydrating massage, and polish. Upgrade to a deluxe or spa pedicure for a truly luxurious experience.</p>
          </div>
        </div>
      </div>

      {/* ACRYLIC */}
      <div className="svc-section" id="acrylic">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="/gallery/IMG_1017.JPEG" alt="Acrylic Nails" loading="lazy"/>
            <span className="svc-img-label">Acrylic Nails</span>
          </div>
          <div>
            <span className="svc-icon-big">03</span>
            <h2 className="svc-title">Acrylic Nails</h2>
            <p className="svc-desc">Acrylic nails offer durability and versatility in one. Whether you want natural-looking extensions or dramatic stilettos, our technicians sculpt to your exact specifications. Includes shaping, filing, and your choice of gel color or polish.</p>
          </div>
        </div>
      </div>

      {/* GEL EXTENSIONS */}
      <div className="svc-section" id="gel">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="/gallery/IMG_1046.JPEG" alt="Gel Extensions" loading="lazy"/>
            <span className="svc-img-label">Gel Extensions</span>
          </div>
          <div>
            <span className="svc-icon-big">04</span>
            <h2 className="svc-title">Gel Extensions</h2>
            <p className="svc-desc">Gel extensions are the lightweight, flexible alternative to acrylics. They feel more natural and are gentler on your natural nails. Perfect for those who want length and durability without the heaviness of traditional acrylics.</p>
          </div>
        </div>
      </div>

      {/* NAIL ART */}
      <div className="svc-section" id="art">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="/gallery/IMG_1041.JPEG" alt="Nail Art" loading="lazy"/>
            <span className="svc-img-label">Nail Art</span>
          </div>
          <div>
            <span className="svc-icon-big">05</span>
            <h2 className="svc-title">Nail Art</h2>
            <p className="svc-desc">Bring your vision to life with custom nail art. From simple geometric accents to intricate hand-painted florals, chrome powder, rhinestone embellishments, and 3D designs — our artists love a creative challenge.</p>
          </div>
        </div>
      </div>

      {/* WAXING */}
      <div className="svc-section" id="waxing">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=700&h=500&fit=crop&auto=format" alt="Waxing Services" loading="lazy"/>
            <span className="svc-img-label">Waxing</span>
          </div>
          <div>
            <span className="svc-icon-big">06</span>
            <h2 className="svc-title">Waxing</h2>
            <p className="svc-desc">Our waxing services deliver smooth, precise results using premium wax formulas gentle on sensitive skin. Perfect for quick touchups or a full facial wax before a big event. All waxing includes soothing aftercare.</p>
          </div>
        </div>
      </div>

      {/* EYELASH EXTENSIONS */}
      <div className="svc-section" id="lashes">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="/gallery/IMG_1062.JPEG" alt="Eyelash Extensions" loading="lazy"/>
            <span className="svc-img-label">Eyelash Extensions</span>
          </div>
          <div>
            <span className="svc-icon-big">07</span>
            <h2 className="svc-title">Eyelash Extensions</h2>
            <p className="svc-desc">Wake up every morning with full, gorgeous lashes. Our lash artists apply individual extensions for a look that ranges from natural and wispy to bold and dramatic. Long-lasting, lightweight, and completely customized to your eye shape.</p>
          </div>
        </div>
      </div>

      {/* PERMANENT MAKEUP */}
      <div className="svc-section" id="permmakeup">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="/gallery/IMG_1059.JPEG" alt="Permanent Makeup" loading="lazy"/>
            <span className="svc-img-label">Permanent Makeup</span>
          </div>
          <div>
            <span className="svc-icon-big">08</span>
            <h2 className="svc-title">Permanent Makeup</h2>
            <p className="svc-desc">Skip the daily routine with semi-permanent makeup that looks flawless around the clock. From microbladed brows to defined lip color and eyeliner, our technicians use precision pigmentation techniques to enhance your natural features.</p>
            <p className="price-note">A touch-up session 6–8 weeks after your initial appointment is recommended for best results.</p>
          </div>
        </div>
      </div>

      {/* BOTOX */}
      <div className="svc-section" id="botox">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1778517436057-4ed5f9fe95bd?w=700&h=500&fit=crop&auto=format" alt="Botox" loading="lazy"/>
            <span className="svc-img-label">Botox</span>
          </div>
          <div>
            <span className="svc-icon-big">09</span>
            <h2 className="svc-title">Botox</h2>
            <p className="svc-desc">Refresh your look with expertly administered cosmetic injections. Whether you want to soften forehead lines, crow&apos;s feet, or frown lines, our injector creates natural-looking results tailored to your face — never frozen, always you.</p>
            <p className="price-note">Free consultation available.</p>
          </div>
        </div>
      </div>

      {/* MASSAGE */}
      <div className="svc-section" id="massage">
        <div className="svc-inner rv">
          <div className="svc-detail-img">
            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&h=500&fit=crop&auto=format" alt="Massage" loading="lazy"/>
            <span className="svc-img-label">Massage</span>
          </div>
          <div>
            <span className="svc-icon-big">10</span>
            <h2 className="svc-title">Massage</h2>
            <p className="svc-desc">Unwind completely with a therapeutic massage designed to ease tension, improve circulation, and restore balance. From a quick relaxation session to a deep tissue treatment, our massage therapists customize every session to your needs.</p>
            <p className="price-note">Book in advance — massage appointments fill quickly.</p>
          </div>
        </div>
      </div>

      {/* BOOKING STRIP */}
      <div className="booking-strip" id="contact">
        <h2>Ready to Book?</h2>
        <p>Call us directly or use our online booking. We&apos;ll match you with the perfect specialist for your service.</p>
        <div style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/book" className="btn-w">Book an Appointment</Link>
          <a href="tel:9284863524" className="btn-w">Call (928) 486-3524</a>
        </div>
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
            <div className="f-hrs"><p>Mon – Sat: 9 AM – 7 PM<br/>Sunday: Closed</p></div>
            <br/>
            <h4>Contact</h4>
            <div className="f-hrs"><p><a href="tel:9284863524" style={{color:'rgba(255,255,255,.7)'}}>(928) 486-3524</a><br/>2120 McCulloch Blvd N, Ste 103<br/>Lake Havasu City, AZ 86403</p></div>
          </div>
        </div>
        <div className="f-bottom">
          <p className="f-copy">© 2026 Nail Nook and More · Lake Havasu City, AZ</p>
          <div className="socials">
            <a href="https://www.instagram.com/nailnook_lhc" target="_blank" rel="noopener noreferrer" className="soc" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg></a>
            <a href="https://www.facebook.com/p/The-Nail-Nook-and-More-LHC-100045411619485/" target="_blank" rel="noopener noreferrer" className="soc" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            
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
            <div className="mb">Hi there. Have questions about a service or want to book? I&apos;m happy to help.</div>
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
