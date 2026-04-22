'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '@/styles/marketing.css'

const SPECIALISTS = [
  {name:'Stephanie',role:'Owner / Nail Tech',spec:'Nail Tech',phone:'928-486-3524',badge:'Owner',bg:'fce4ec',fg:'e91e8c'},
  {name:'Raquel',role:'Nail Technician',spec:'Nail Tech',phone:'928-846-1087',badge:'',bg:'f9a8c9',fg:'c2185b'},
  {name:'Jessica',role:'Nail Technician',spec:'Nail Tech',phone:'928-412-3735',badge:'',bg:'fce4ec',fg:'e91e8c'},
  {name:'Katie',role:'Nail Technician',spec:'Nail Tech',phone:'928-412-5323',badge:'',bg:'f9a8c9',fg:'c2185b'},
  {name:'Selena',role:'Nail Technician',spec:'Nail Tech',phone:'928-662-8250',badge:'',bg:'fce4ec',fg:'e91e8c'},
  {name:'Shannon',role:'Nail Technician',spec:'Nail Tech',phone:'928-412-6965',badge:'',bg:'f9a8c9',fg:'c2185b'},
  {name:'Rita',role:'Nail Technician',spec:'Nail Tech',phone:'480-241-9972',badge:'',bg:'fce4ec',fg:'e91e8c'},
  {name:'Ricci',role:'Hair Specialist',spec:'Hair Specialist',phone:'928-542-1115',badge:'',bg:'f9a8c9',fg:'c2185b'},
  {name:'Cathy',role:'Hair Specialist',spec:'Hair Specialist',phone:'928-706-6177',badge:'',bg:'fce4ec',fg:'e91e8c'},
  {name:'Amanda',role:'Hair Specialist',spec:'Hair Specialist',phone:'909-996-1121',badge:'',bg:'f9a8c9',fg:'c2185b'},
  {name:'Kendall',role:'Restoration Med Spa',spec:'Restoration Med Spa',phone:'928-706-1575',badge:'',bg:'fce4ec',fg:'e91e8c'},
  {name:'Laura',role:'Masus',spec:'Masus',phone:'928-486-7756',badge:'',bg:'f9a8c9',fg:'c2185b'},
  {name:'Shelby',role:'Waxing Specialist',spec:'Waxer',phone:'951-532-6685',badge:'',bg:'fce4ec',fg:'e91e8c'},
  {name:'Ashly',role:'Eyelash Specialist',spec:'Eyelashes',phone:'928-302-0949',badge:'',bg:'f9a8c9',fg:'c2185b'},
]

const PHOTOS = [
  'https://cdn4.localdatacdn.com/az/lake-havasu-city/3897526/original/TKcG0YgFKr.jpg',
  'https://cdn6.localdatacdn.com/az/lake-havasu-city/3897526/original/rsgxXXUnjr.jpg',
  'https://cdn6.localdatacdn.com/az/lake-havasu-city/3897526/original/W55KSEQutB.jpg',
  'https://cdn3.localdatacdn.com/az/lake-havasu-city/3897526/original/kNCkf0XFjy.jpg',
  'https://cdn10.localdatacdn.com/az/lake-havasu-city/3897526/original/gZmWj1BsgR.jpg',
  'https://cdn3.localdatacdn.com/az/lake-havasu-city/3897526/original/rmNJ5fJMyB.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/dukQmfyqNn.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/7JFDVLKWyw.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/WA7SSlo0zl.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/u4xWnWyzfJ.jpg',
  'https://cdn3.localdatacdn.com/az/lake-havasu-city/3897526/original/kVLl9Hggak.jpg',
  'https://cdn3.localdatacdn.com/az/lake-havasu-city/3897526/original/9IsXbDySHu.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/YHNVWqafCZ.jpg',
  'https://cdn3.localdatacdn.com/az/lake-havasu-city/3897526/original/veMUJEfeQA.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/YFTSGQaYwE.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/Rm9EgPVK4v.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/0WVGg6iGVk.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/WxYPtlCuXQ.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/VJspcnmZJR.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/EFE2l0dEBL.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/7OADMHAazE.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/EFCG34oaMf.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/K4FL6KifUY.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/nbnKLhZB6Z.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/4FMqfaxry0.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/RNtNsAKaXV.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/OGdXebC2sZ.jpg',
  'https://cdn.localdatacdn.com/az/lake-havasu-city/3897526/original/BJ0cfYgFj9.jpg',
  'https://cdn2.localdatacdn.com/az/lake-havasu-city/3897526/original/LFJL363m74.jpg',
  'https://cdn5.localdatacdn.com/az/lake-havasu-city/3897526/original/hgrLSU0sEu.jpg',
  'https://cdn5.localdatacdn.com/az/lake-havasu-city/3897526/original/PQA3W2WJwt.jpg',
  'https://cdn5.localdatacdn.com/az/lake-havasu-city/3897526/original/Sakzbh4ahC.jpg',
  'https://cdn3.localdatacdn.com/az/lake-havasu-city/3897526/original/9zoRkeGxB4.jpg',
]

export default function TeamPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // ---- SCROLL REVEAL ----
    const ro = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis') }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
    document.querySelectorAll('.rv').forEach(el => ro.observe(el))

    // ---- LIGHTBOX ----
    const allImgs = SPECIALISTS.flatMap((_, si) =>
      Array.from({length: 6}, (__, i) => PHOTOS[(si * 6 + i) % PHOTOS.length])
    )
    let lbxIdx = 0
    function lbxOpen(i: number) {
      lbxIdx = i
      ;(document.getElementById('lbx-img') as HTMLImageElement).src = allImgs[i]
      document.getElementById('lbx')!.classList.add('on')
      document.body.style.overflow = 'hidden'
    }
    function lbxClose() {
      document.getElementById('lbx')?.classList.remove('on')
      document.body.style.overflow = ''
    }
    function lbxNav(d: number) {
      lbxIdx = (lbxIdx + d + allImgs.length) % allImgs.length
      ;(document.getElementById('lbx-img') as HTMLImageElement).src = allImgs[lbxIdx]
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lbxClose()
      if (e.key === 'ArrowLeft') lbxNav(-1)
      if (e.key === 'ArrowRight') lbxNav(1)
    }
    document.addEventListener('keydown', handleKeyDown)
    ;(window as any).__lbxOpenTeam = lbxOpen
    ;(window as any).__lbxCloseTeam = lbxClose
    ;(window as any).__lbxNavTeam = lbxNav

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
      if (el) el.innerHTML = '<button class="qr" onclick="window.__qrTeam(\'book\')">Book Appointment</button><button class="qr" onclick="window.__qrTeam(\'svc\')">View Services</button><button class="qr" onclick="window.__qrTeam(\'hrs\')">Hours & Location</button>'
    }
    function qr(t: string) {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = ''
      if (t === 'book') { usrMsg('Book an appointment'); setTimeout(() => { botMsg('Head over to our <a href="/book">booking page</a> or call <a href="tel:9288556425">(928) 855-6425</a>.'); resetQrs() }, 500) }
      else if (t === 'svc') { usrMsg('View Services'); setTimeout(() => { botMsg('See our full menu on the <a href="/services">services page</a>.'); resetQrs() }, 500) }
      else if (t === 'hrs') { usrMsg('Hours & Location'); setTimeout(() => { botMsg('2120 McCulloch Blvd N, Suite 103, Lake Havasu City, AZ<br>Mon–Sat: 9 AM – 7 PM · Sun: 10 AM – 5 PM<br><a href="tel:9288556425">(928) 855-6425</a>'); resetQrs() }, 500) }
    }
    function sendMsg() {
      const inp = document.getElementById('cinp') as HTMLInputElement
      const t = inp?.value.trim(); if (!t) return
      usrMsg(t); inp.value = ''
      setTimeout(() => { botMsg("For fastest service call <a href='tel:9288556425'>(928) 855-6425</a>"); resetQrs() }, 700)
    }

    resetQrs()
    ;(window as any).__qrTeam = qr
    ;(window as any).__toggleChatTeam = toggleChat
    ;(window as any).__closeChatTeam = closeChat
    ;(window as any).__sendMsgTeam = sendMsg

    return () => {
      clearTimeout(chatTimer)
      document.removeEventListener('keydown', handleKeyDown)
      ro.disconnect()
      ;['__lbxOpenTeam','__lbxCloseTeam','__lbxNavTeam','__qrTeam','__toggleChatTeam','__closeChatTeam','__sendMsgTeam'].forEach(k => delete (window as any)[k])
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
        <span className="lbl-plain" style={{animation:'mktFadeUp .7s ease both'}}>Meet the Artists</span>
        <h1 className="pg-title" style={{animation:'mktFadeUp .7s .15s ease both'}}>Our Nail Specialists</h1>
        <p className="pg-sub" style={{animation:'mktFadeUp .7s .3s ease both'}}>14 passionate artists dedicated to making your nails a work of art. Each with their own signature style, specialty, and love for the craft.</p>
      </div>

      {/* INTRO */}
      <div className="intro">
        <p>At Nail Nook, we believe beautiful nails start with talented, caring people. Our team of certified nail technicians and senior artists bring years of expertise and genuine passion to every appointment — from classic manicures to complex custom designs. We take pride in a clean, welcoming environment and results that make you feel your absolute best.</p>
        <div className="intro-divider"/>
        <Link href="/book" className="btn btn-p">Book with a Specialist</Link>
      </div>

      {/* SPECIALIST GRID */}
      <div className="spec-sec">
        <div className="spec-grid">
          {SPECIALISTS.map((sp, si) => {
            const galImgs = Array.from({length: 6}, (_, i) => PHOTOS[(si * 6 + i) % PHOTOS.length])
            const baseIdx = si * 6
            return (
              <div key={sp.name} className="sc rv" style={{transitionDelay: `${si * 0.06}s`}}>
                <div className="sc-top">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sp.name)}&background=${sp.bg}&color=${sp.fg}&size=400&bold=true`}
                    alt={sp.name}
                    loading="lazy"
                  />
                  {sp.badge && <span className="sc-badge">{sp.badge}</span>}
                </div>
                <div className="sc-body">
                  <h3>{sp.name}</h3>
                  <span className="sc-role">{sp.spec}</span>
                  <a className="sc-phone" href={`tel:${sp.phone.replace(/\D/g,'')}`}>{sp.phone}</a>
                  <div className="sc-gal">
                    {galImgs.map((u, i) => (
                      <img
                        key={i}
                        src={u}
                        alt={`Work sample ${i + 1}`}
                        loading="lazy"
                        onClick={(e) => { e.stopPropagation(); (window as any).__lbxOpenTeam?.(baseIdx + i) }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
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
            <button className="cx" onClick={() => (window as any).__closeChatTeam?.()}>✕</button>
          </div>
          <div className="cmsgs" id="cmsgs">
            <div className="mb">Hi there. Looking to book with a specific specialist? I can help.</div>
          </div>
          <div className="qrs" id="qrs"/>
          <div className="c-inp-area">
            <input type="text" className="c-inp" id="cinp" placeholder="Type a message…"
              onKeyDown={(e) => { if (e.key === 'Enter') (window as any).__sendMsgTeam?.() }}/>
            <button className="c-send" onClick={() => (window as any).__sendMsgTeam?.()}>➤</button>
          </div>
        </div>
        <div className="cb" onClick={() => (window as any).__toggleChatTeam?.()}>
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
        </div>
      </div>

      {/* LIGHTBOX */}
      <div className="lbx" id="lbx" onClick={() => (window as any).__lbxCloseTeam?.()}>
        <button className="lbx-x">✕</button>
        <button className="lbx-nav lbx-prev" onClick={(e) => { e.stopPropagation(); (window as any).__lbxNavTeam?.(-1) }}>‹</button>
        <img id="lbx-img" src="data:," alt="Nail art"/>
        <button className="lbx-nav lbx-next" onClick={(e) => { e.stopPropagation(); (window as any).__lbxNavTeam?.(1) }}>›</button>
      </div>
    </div>
  )
}
