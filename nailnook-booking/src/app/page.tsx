'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '@/styles/marketing.css'

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // ---- GALLERY SLIDESHOW ----
    const seeds = [200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217]
    const imgs = seeds.map(s => `https://picsum.photos/seed/${s}/800/1000`)
    const slidesEl = document.getElementById('slides') as HTMLElement | null
    const dotsEl = document.getElementById('ssDots') as HTMLElement | null
    if (!slidesEl || !dotsEl) return
    slidesEl.innerHTML = ''
    dotsEl.innerHTML = ''
    const PER = 3
    const FRAMES = Math.ceil(imgs.length / PER)
    for (let i = 0; i < PER; i++) {
      const slot = document.createElement('div')
      slot.className = 'slot'
      slot.innerHTML = `<div class="layer on"><img alt="Nail art"></div><div class="layer"><img alt="Nail art"></div>`
      const idx = i
      slot.querySelectorAll('img').forEach(img => {
        (img as HTMLImageElement).onclick = () => lbxOpen((ssFrame * PER + idx) % imgs.length)
      })
      slidesEl.appendChild(slot)
    }
    for (let f = 0; f < FRAMES; f++) {
      const b = document.createElement('button')
      b.className = 'ss-dot' + (f === 0 ? ' on' : '')
      b.setAttribute('aria-label', `Frame ${f + 1}`)
      const fi = f
      b.onclick = () => ssGo(fi)
      dotsEl.appendChild(b)
    }
    let ssFrame = 0
    let ssTimer: ReturnType<typeof setInterval>
    let ssActive = 0
    function ssRender() {
      const slots = slidesEl!.children
      const next = 1 - ssActive
      for (let i = 0; i < PER; i++) {
        const idx = (ssFrame * PER + i) % imgs.length
        const layers = slots[i].querySelectorAll('.layer')
        ;(layers[next].querySelector('img') as HTMLImageElement).src = imgs[idx]
        layers[ssActive].classList.remove('on')
        layers[next].classList.add('on')
      }
      ssActive = next
      Array.from(dotsEl!.children).forEach((d, i) => d.classList.toggle('on', i === ssFrame))
    }
    function ssShow(f: number) { ssFrame = (f + FRAMES) % FRAMES; ssRender() }
    function ssNav(d: number) { ssShow(ssFrame + d); ssReset() }
    function ssGo(f: number) { ssShow(f); ssReset() }
    function ssReset() { clearInterval(ssTimer); ssTimer = setInterval(() => ssShow(ssFrame + 1), 4000) }
    const slots0 = slidesEl.children
    for (let i = 0; i < PER; i++) {
      (slots0[i].querySelectorAll('img')[0] as HTMLImageElement).src = imgs[i]
    }
    ssReset();
    (window as any).__ssNav = ssNav

    // ---- LIGHTBOX ----
    let lbxIdx = 0
    function lbxOpen(i: number) {
      lbxIdx = i
      ;(document.getElementById('lbx-img') as HTMLImageElement).src = imgs[i]
      document.getElementById('lbx')!.classList.add('on')
      document.body.style.overflow = 'hidden'
    }
    function lbxClose() {
      document.getElementById('lbx')?.classList.remove('on')
      document.body.style.overflow = ''
    }
    function lbxNav(d: number) {
      lbxIdx = (lbxIdx + d + imgs.length) % imgs.length
      ;(document.getElementById('lbx-img') as HTMLImageElement).src = imgs[lbxIdx]
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lbxClose()
      if (e.key === 'ArrowLeft') lbxNav(-1)
      if (e.key === 'ArrowRight') lbxNav(1)
    }
    document.addEventListener('keydown', handleKeyDown)
    ;(window as any).__lbxClose = lbxClose
    ;(window as any).__lbxNav = lbxNav

    // ---- SCROLL REVEAL ----
    const ro = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.rv').forEach(el => ro.observe(el))

    // ---- PARALLAX ----
    const handleScroll = () => {
      const hi = document.getElementById('heroImg')
      if (hi) hi.style.transform = `scale(1.05) translateY(${window.scrollY * 0.25}px)`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // ---- CHATBOT ----
    let chatOpen = false
    const chatTimer = setTimeout(() => {
      if (!chatOpen) {
        document.getElementById('cwin')?.classList.add('on')
        chatOpen = true
        const ndot = document.querySelector('.ndot') as HTMLElement | null
        if (ndot) ndot.style.display = 'none'
      }
    }, 2000)

    function toggleChat() {
      chatOpen = !chatOpen
      document.getElementById('cwin')?.classList.toggle('on', chatOpen)
      const ndot = document.querySelector('.ndot') as HTMLElement | null
      if (ndot) ndot.style.display = 'none'
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
      if (el) el.innerHTML = '<button class="qr" onclick="window.__qr(\'book\')">Book Appointment</button><button class="qr" onclick="window.__qr(\'svc\')">Services & Pricing</button><button class="qr" onclick="window.__qr(\'hrs\')">Hours & Location</button><button class="qr" onclick="window.__qr(\'team\')">Our Team</button>'
    }
    function setQrs(html: string) {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = html
    }

    const KB = [
      {k:['hour','open','close','time','when','today'],a:"Our hours:<br>Mon–Sat: 9 AM – 7 PM<br>Sunday: 10 AM – 5 PM"},
      {k:['address','location','where','map','havasu'],a:"2120 McCulloch Blvd N, Suite 103<br>Lake Havasu City, AZ 86403<br>Free parking out front."},
      {k:['phone','call','number','contact'],a:"Call us at <a href='tel:9288556425'>(928) 855-6425</a>."},
      {k:['walkin','walk-in','walk in'],a:"Walk-ins welcome when we have openings. Appointments recommended on weekends."},
      {k:['cancel','reschedul'],a:"Free cancellations up to 24 hours before. Call <a href='tel:9288556425'>(928) 855-6425</a>."},
      {k:['pay','payment','cash','card'],a:"We accept cash, all major cards, Apple Pay, and Google Pay."},
      {k:['manicure','mani'],a:"Manicures: Classic $25 · Gel $40 · Spa $45 · Gel Removal $10"},
      {k:['pedicure','pedi'],a:"Pedicures: Classic $35 · Gel $50 · Spa $55 · Deluxe $65"},
      {k:['acrylic','full set'],a:"Acrylic: Full Set $55 · w/Tips $65 · Fill-In $35 · Removal $15"},
      {k:['gel extension','builder gel'],a:"Gel Extensions: Full Set $65 · Refill $45 · Builder Gel $70 · Removal $15"},
      {k:['dip'],a:"Dip Powder from $45. Chip-resistant, lasts 3–4 weeks."},
      {k:['nail art','design','chrome','ombre'],a:"Nail Art from $5. Custom designs, chrome, ombre, gems, 3D art."},
      {k:['wax','eyebrow','lip'],a:"Waxing: Eyebrow $15 · Lip $10 · Full Face $35"},
      {k:['price','cost','how much','pricing'],a:"Mani from $25 · Pedi from $35 · Acrylic from $55 · Gel from $65 · Dip from $45 · Art from $5 · Waxing from $10<br><a href='/services'>Full menu →</a>"},
      {k:['team','staff','specialist'],a:"We have 14 passionate nail specialists.<br><a href='/team'>Meet the team →</a>"},
      {k:['hi','hello','hey'],a:"Hi there, welcome to Nail Nook! How can I help?"},
      {k:['thank','thanks'],a:"You're very welcome! Anything else?"},
    ]

    let bookState: string | null = null
    let bookData: Record<string, string> = {}
    const SERVICES = ['Manicure','Pedicure','Acrylic Nails','Gel Extensions','Dip Powder','Nail Art','Waxing']

    function startBooking() {
      botMsg("I can book your appointment two ways — which do you prefer?")
      setQrs('<button class="qr" onclick="window.__bookPath(\'chat\')">Book with me here</button><button class="qr" onclick="window.__bookPath(\'self\')">I\'ll fill the form myself</button>')
    }
    function bookPath(p: string) {
      setQrs('')
      if (p === 'self') {
        usrMsg("I'll do it myself")
        setTimeout(() => { botMsg("Head over to our <a href='/book'>booking page</a>."); resetQrs() }, 450)
      } else {
        usrMsg("Book me here")
        bookState = 'name'; bookData = {}
        setTimeout(() => botMsg("Great! What's your <b>name</b>?"), 450)
      }
    }
    function pickService(s: string) {
      usrMsg(s); bookData.service = s; bookState = 'specialist'; setQrs('')
      setTimeout(() => {
        botMsg("Great choice! Preferred specialist?")
        setQrs('<button class="qr" onclick="window.__noSpecPref()">No preference</button>')
      }, 400)
    }
    function noSpecPref() {
      usrMsg("No preference"); bookData.specialist = 'No Preference'; bookState = 'date'; setQrs('')
      setTimeout(() => botMsg("When would you like to come in? (e.g. 'Saturday 2pm')"), 400)
    }
    function confirmBooking() {
      usrMsg("Confirm & Send"); setQrs('')
      setTimeout(() => {
        botMsg(`Request sent! We'll call you at <b>${bookData.phone}</b> within a few hours to confirm. See you at Nail Nook!`)
        bookState = null; bookData = {}; resetQrs()
      }, 600)
    }
    function cancelBooking() {
      usrMsg("Cancel"); bookState = null; bookData = {}
      setTimeout(() => { botMsg("No worries! Let me know if you change your mind."); resetQrs() }, 400)
    }
    function handleBookingReply(t: string) {
      if (bookState === 'name') {
        if (t.length < 2) { botMsg("Could I get your full name?"); return }
        bookData.name = t; bookState = 'phone'
        setTimeout(() => botMsg(`Nice to meet you, ${t.split(' ')[0]}! What's your <b>phone number</b>?`), 400)
      } else if (bookState === 'phone') {
        if (t.replace(/\D/g,'').length < 10) { botMsg("Could I get a 10-digit phone number?"); return }
        bookData.phone = t; bookState = 'service'
        setTimeout(() => {
          botMsg("Which <b>service</b> would you like?")
          setQrs(SERVICES.map(s => `<button class="qr" onclick="window.__pickService('${s}')">${s}</button>`).join(''))
        }, 400)
      } else if (bookState === 'specialist') {
        bookData.specialist = t; bookState = 'date'
        setTimeout(() => botMsg("When would you like to come in?"), 400)
      } else if (bookState === 'date') {
        bookData.notes = 'Preferred time: ' + t; bookState = 'confirm'
        setTimeout(() => {
          botMsg(`Here's your request:<br><br><b>Name:</b> ${bookData.name}<br><b>Phone:</b> ${bookData.phone}<br><b>Service:</b> ${bookData.service}<br><b>Specialist:</b> ${bookData.specialist || 'No Preference'}<br><b>Time:</b> ${t}<br><br>Ready to send?`)
          setQrs('<button class="qr" onclick="window.__confirmBooking()">Confirm & Send</button><button class="qr" onclick="window.__cancelBooking()">Cancel</button>')
        }, 400)
      }
    }
    function qr(t: string) {
      setQrs('')
      if (t === 'book') { usrMsg('Book an appointment'); setTimeout(startBooking, 450) }
      else if (t === 'svc') { usrMsg('Services & Pricing'); setTimeout(() => { botMsg(KB.find(k=>k.k.includes('price'))!.a); resetQrs() }, 450) }
      else if (t === 'team') { usrMsg('Our Team'); setTimeout(() => { botMsg(KB.find(k=>k.k.includes('team'))!.a); resetQrs() }, 450) }
      else if (t === 'hrs') { usrMsg('Hours & Location'); setTimeout(() => { botMsg("Mon–Sat: 9 AM – 7 PM<br>Sunday: 10 AM – 5 PM<br><br>2120 McCulloch Blvd N, Suite 103<br>Lake Havasu City, AZ 86403<br><a href='tel:9288556425'>(928) 855-6425</a>"); resetQrs() }, 450) }
    }
    function sendMsg() {
      const inp = document.getElementById('cinp') as HTMLInputElement
      const t = inp?.value.trim(); if (!t) return
      usrMsg(t); inp.value = ''
      setTimeout(() => {
        if (bookState && bookState !== 'confirm') { handleBookingReply(t); return }
        const lc = t.toLowerCase()
        if (/\b(book|appointment|schedule)\b/.test(lc)) { startBooking(); return }
        for (const e of KB) { if (e.k.some(k => lc.includes(k))) { botMsg(e.a); resetQrs(); return } }
        botMsg("I'm not sure on that one. Call <a href='tel:9288556425'>(928) 855-6425</a> or I can book your appointment here.")
        resetQrs()
      }, 500)
    }

    resetQrs()
    ;(window as any).__qr = qr
    ;(window as any).__bookPath = bookPath
    ;(window as any).__pickService = pickService
    ;(window as any).__noSpecPref = noSpecPref
    ;(window as any).__confirmBooking = confirmBooking
    ;(window as any).__cancelBooking = cancelBooking
    ;(window as any).__toggleChat = toggleChat
    ;(window as any).__closeChat = closeChat
    ;(window as any).__sendMsg = sendMsg

    return () => {
      clearInterval(ssTimer)
      clearTimeout(chatTimer)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll)
      ro.disconnect()
      ;['__ssNav','__lbxClose','__lbxNav','__qr','__bookPath','__pickService','__noSpecPref','__confirmBooking','__cancelBooking','__toggleChat','__closeChat','__sendMsg'].forEach(k => delete (window as any)[k])
    }
  }, [])

  return (
    <div className="mkt">
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="logo">
          <svg viewBox="0 0 28 28" fill="none">
            <rect x="10" y="1" width="8" height="5" rx="2.5" fill="#e91e8c"/>
            <path d="M8 6h12l2.5 20H5.5L8 6z" fill="#f9a8c9"/>
            <path d="M8 6h12l1.2 9H6.8L8 6z" fill="#e91e8c" opacity=".55"/>
            <rect x="9.5" y="2.5" width="9" height="2" rx="1" fill="#c2185b"/>
          </svg>
          Nail Nook
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

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"/>
        <div className="hero-img" id="heroImg"/>
        <div className="hero-content">
          <span className="eyebrow">Lake Havasu City · Arizona</span>
          <h1>Luxury Nails.<br/><em>Effortless Beauty.</em></h1>
          <p className="hero-sub">Lake Havasu&apos;s favorite self-care stop — because you deserve more than just a quick polish.</p>
          <div className="hero-btns">
            <Link href="/book" className="btn btn-p">Book Appointment</Link>
            <Link href="/services" className="btn btn-s">View Services</Link>
          </div>
        </div>
        <div className="scroll-cue"><span>Scroll</span><div className="scroll-line"/></div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="sec sec-alt">
        <div className="sec-hdr">
          <span className="lbl-plain">What We Offer</span>
          <h2 className="sec-title">Our Services</h2>
          <p className="sec-sub">From classic manicures to intricate nail art — crafted with precision and care.</p>
        </div>
        <div className="svc-grid">
          {[
            {href:'/services#manicure',img:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=450&fit=crop&auto=format',alt:'Manicure',name:'Manicure',desc:'Classic, gel, and spa manicures. Perfectly shaped and polished every time.',from:'From $25',cls:'rv'},
            {href:'/services#pedicure',img:'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&h=450&fit=crop&auto=format',alt:'Pedicure',name:'Pedicure',desc:'Relaxing pedicure treatments from classic to luxurious spa experiences.',from:'From $35',cls:'rv d1'},
            {href:'/services#acrylic',img:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=450&fit=crop&auto=format&crop=right',alt:'Acrylic Nails',name:'Acrylic Nails',desc:'Long-lasting acrylic extensions for a glamorous, durable finish.',from:'From $55',cls:'rv d2'},
            {href:'/services#gel',img:'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&h=450&fit=crop&auto=format',alt:'Gel Extensions',name:'Gel Extensions',desc:'Lightweight, flexible gel extensions with a natural look and feel.',from:'From $65',cls:'rv d3'},
            {href:'/services#dip',img:'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&h=450&fit=crop&auto=format&crop=left',alt:'Dip Powder',name:'Dip Powder',desc:'Chip-resistant dip powder nails in hundreds of gorgeous shades.',from:'From $45',cls:'rv d4'},
            {href:'/services#art',img:'https://images.unsplash.com/photo-1632345031435-8727f592d8db?w=600&h=450&fit=crop&auto=format',alt:'Nail Art',name:'Nail Art',desc:'Custom designs, gems, chrome, ombre, and hand-painted artwork.',from:'From $5',cls:'rv d5'},
            {href:'/services#waxing',img:'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&h=450&fit=crop&auto=format',alt:'Waxing',name:'Waxing',desc:'Smooth, precise waxing for eyebrows, lips, face, and more.',from:'From $10',cls:'rv'},
          ].map(s => (
            <Link key={s.name} href={s.href} className={`svc-card ${s.cls}`}>
              <img className="svc-img" src={s.img} alt={s.alt} loading="lazy"/>
              <div className="svc-body">
                <span className="svc-icon"/>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <span className="svc-more">{s.from} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="sec">
        <div className="sec-hdr c">
          <span className="lbl-plain">Our Work</span>
          <h2 className="sec-title">Nail Art Gallery</h2>
          <p className="sec-sub">A glimpse of what our specialists create every single day.</p>
        </div>
        <div className="slideshow" id="slideshow">
          <button className="ss-nav ss-prev" onClick={() => (window as any).__ssNav?.(-1)} aria-label="Previous">‹</button>
          <div className="slides" id="slides"/>
          <button className="ss-nav ss-next" onClick={() => (window as any).__ssNav?.(1)} aria-label="Next">›</button>
        </div>
        <div className="ss-dots" id="ssDots"/>
      </section>

      {/* TEAM TEASER */}
      <section className="sec sec-alt">
        <div className="sec-hdr c">
          <span className="lbl-plain">The Artists</span>
          <h2 className="sec-title">Meet Our Team</h2>
        </div>
        <div className="team-group rv">
          <Link href="/team">
            <img src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1400&h=800&fit=crop&auto=format" alt="The Nail Nook team" loading="lazy"/>
          </Link>
        </div>
        <div className="team-cta"><Link href="/team" className="btn btn-p">Meet Our Specialists</Link></div>
      </section>

      {/* REVIEWS */}
      <section className="sec">
        <div className="sec-hdr c">
          <span className="lbl-plain">Client Love</span>
          <h2 className="sec-title">What Our Guests Say</h2>
          <p className="sec-sub">Real reviews from real clients across Lake Havasu City.</p>
        </div>
        <div className="reviews-grid">
          {[
            {i:'LF',n:'Linda F.',t:'5 months ago',q:'Highly recommended. Stephanie is amazing. During my first appointment she had quite a job to completely remove the old acrylic nail stuff from my nails. She was patient, gentle, and my nails have never looked better.',c:'rv'},
            {i:'TL',n:'Tricia L.',t:'7 months ago',q:"My tech is Kattie and she's a pro for sure. She did a hard gel full set with French manicure. OMG I'm so thrilled with how they turned out — the shape, the color, everything is perfect.",c:'rv d1'},
            {i:'KB',n:'Kathryn B.',t:'January 2025',q:"Rita at Nail Nook is amazing. She's not only incredibly talented but also so kind and professional. She fit me in last-minute before the holidays and her attention to detail is next level.",c:'rv d2'},
            {i:'DW',n:'Denise W.',t:'November 2024',q:'Rita Davenport gave me the best pedi I have ever had in Lake Havasu. She was gentle yet so thorough. So grateful to have found a place that feels like a true spa experience right here in town.',c:'rv d3'},
            {i:'NM',n:'Nikki M.',t:'2 years ago',q:'Kattie did my nails and was absolutely amazing. She was so sweet and made sure to explain every decision she made and how it would help my nails stay healthy. The salon is very cute too — highly recommend.',c:'rv d4'},
            {i:'MG',n:'Maria G.',t:'4 years ago',q:"I've been coming to Nail Nook for years now and wouldn't go anywhere else. The staff remembers you by name, the salon is spotless, and my nails always look flawless when I leave. A true Lake Havasu gem.",c:'rv d5'},
          ].map(r => (
            <div key={r.n} className={`rev-card ${r.c}`}>
              <span className="rev-source">Google</span>
              <div className="rev-stars">★★★★★</div>
              <p className="rev-text">&ldquo;{r.q}&rdquo;</p>
              <div className="rev-meta">
                <div className="rev-avatar">{r.i}</div>
                <div className="rev-info"><h4>{r.n}</h4><span>{r.t}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAP */}
      <div className="map-wrap">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3268.123456789!2d-114.3226!3d34.4839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80ce8b0b0b0b0b0b%3A0x0!2s2120+McCulloch+Blvd+N+Suite+103%2C+Lake+Havasu+City%2C+AZ+86403!5e0!3m2!1sen!2sus!4v1234567890"
          width="100%" height="400" style={{border:0,display:'block'}} allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Nail Nook — 2120 McCulloch Blvd N, Lake Havasu City, AZ"
        />
      </div>

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

      {/* CHATBOT */}
      <div className="cw">
        <div className="cwin" id="cwin">
          <div className="ch2">
            <div className="ch2-info">
              <div className="cav">NN</div>
              <div className="ch2-text"><h4>Nail Nook Assistant</h4><span>● Online now</span></div>
            </div>
            <button className="cx" onClick={() => (window as any).__closeChat?.()}>✕</button>
          </div>
          <div className="cmsgs" id="cmsgs">
            <div className="mb">Hi there, welcome to Nail Nook. I&apos;m here to help you book or answer questions. What brings you in today?</div>
          </div>
          <div className="qrs" id="qrs"/>
          <div className="c-inp-area">
            <input type="text" className="c-inp" id="cinp" placeholder="Type a message…"
              onKeyDown={(e) => { if (e.key === 'Enter') (window as any).__sendMsg?.() }}/>
            <button className="c-send" onClick={() => (window as any).__sendMsg?.()}>➤</button>
          </div>
        </div>
        <div className="cb" onClick={() => (window as any).__toggleChat?.()}>
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
          <div className="ndot"/>
        </div>
      </div>

      {/* LIGHTBOX */}
      <div className="lbx" id="lbx" onClick={() => (window as any).__lbxClose?.()}>
        <button className="lbx-x">✕</button>
        <button className="lbx-nav lbx-prev" onClick={(e) => { e.stopPropagation(); (window as any).__lbxNav?.(-1) }}>‹</button>
        <img id="lbx-img" src="" alt="Nail art"/>
        <button className="lbx-nav lbx-next" onClick={(e) => { e.stopPropagation(); (window as any).__lbxNav?.(1) }}>›</button>
      </div>
    </div>
  )
}
