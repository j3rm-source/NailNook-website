'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '@/styles/marketing.css'

const SPECIALISTS = [
  {name:'Stephanie',role:'Owner / Nail Tech',spec:'Nail Tech',phone:'928-486-3524',badge:'Owner',bg:'fce4ec',fg:'e91e8c',photo:'/team/stephanie/headshot.jpg',imgPos:'center 25%',photos:['/team/stephanie/work-1.jpg','/team/stephanie/work-2.png','/team/stephanie/work-3.jpg','/team/stephanie/work-4.jpg','/team/stephanie/work-5.jpg','/team/stephanie/work-7.jpg']},
  {name:'Raquel',role:'Nail Technician',spec:'Nail Tech',phone:'928-846-1087',badge:'',bg:'f9a8c9',fg:'c2185b',photo:'/team/raquel/headshot.jpg',imgPos:'center 35%',photos:['/team/raquel/work-9.png','/team/raquel/work-4.jpg','/team/raquel/work-5.jpg','/team/raquel/work-6.jpg','/team/raquel/work-7.png','/team/raquel/work-8.png','/team/raquel/work-1.jpg'],showCount:6},
  {name:'Kattie',role:'Nail Technician',spec:'Nail Tech',phone:'928-412-5323',badge:'',bg:'f9a8c9',fg:'c2185b',photo:'/team/katie/headshot.jpg',imgPos:'center 20%',photos:['/team/katie/work-1.jpg','/team/katie/work-2.jpg','/team/katie/work-3.jpg','/team/katie/work-4.jpg','/team/katie/work-5.jpg','/team/katie/work-5.jpg']},
  {name:'Shannon',role:'Nail Technician',spec:'Nail Tech',phone:'928-412-6965',badge:'',bg:'f9a8c9',fg:'c2185b',photo:'/team/shannon/headshot.jpg',imgPos:'',photos:['/team/shannon/mainicure.png.jpg','/team/shannon/work-2.jpg','/team/shannon/work-3.jpg','/team/shannon/work-4.jpg','/team/shannon/work-5.jpg','/team/shannon/work-6.jpg']},
  {name:'Rita',role:'Nail Technician',spec:'Nail Tech',phone:'',badge:'',bg:'f9a8c9',fg:'c2185b',photo:'/team/rita/727255724516679206.png',imgPos:'center 20%',photos:['/team/rita/IMG_2929.PNG','/team/rita/IMG_2928.PNG','/team/rita/11176.JPG','/team/rita/11185.JPG','/team/rita/11563.JPG','/team/rita/11654.JPG','/team/rita/11806.JPG'],showCount:6},
  {name:'Ricci',role:'Hair Specialist',spec:'Hair Specialist',phone:'928-542-1115',badge:'',bg:'f9a8c9',fg:'c2185b',photo:'/team/ricci/work-1.jpg',imgPos:'center 20%',photos:['/team/ricci/work-2.jpg','/team/ricci/work-3.jpg','/team/ricci/work-4.jpg','/team/ricci/work-5.jpg','/team/ricci/work-6.jpg','/team/ricci/headshot.jpg'],bookingLink:'https://manegirlricci.glossgenius.com'},
  {name:'Lara',role:'Massage Therapist',spec:'Masseuse',phone:'928-486-7756',badge:'',bg:'f9a8c9',fg:'c2185b',photo:'/team/lara/headshot.jpg',imgPos:'center 20%',photos:['/team/lara/before-after.jpg','/team/lara/video-1.mp4','/team/lara/video-2.mp4','/team/lara/video-3.mp4','/team/lara/video-4.mp4']},
  {name:'Shelby',role:'Waxing Specialist',spec:'Wax Tech',phone:'928-487-1831',badge:'',bg:'fce4ec',fg:'e91e8c',photo:'/team/shelby/headshot.jpg',imgPos:'center 10%',photos:['/team/shelby/work-5.jpg','/team/shelby/work-6.jpg','/team/shelby/work-1.jpg','/team/shelby/work-2.jpg','/team/shelby/work-3.jpg','/team/shelby/work-4.jpg'],bookingLink:'https://square.site/book/3WBG6E55P47D7/skincare-by-shelby-lake-havasu-city-az'},
  {name:'Ashley',role:'Eyelash Specialist',spec:'Eyelash Tech and Permanent Makeup',phone:'928-302-0949',badge:'',bg:'f9a8c9',fg:'c2185b',
    photo:'/team/ashly/headshot.jpg',imgPos:'',
    photos:['/team/ashly/work-1.jpg','/team/ashly/work-2.jpg','/team/ashly/work-3.jpg','/team/ashly/work-4.jpg','/team/ashly/work-5.jpg','/team/ashly/work-1.jpg']},
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
    let lbxImgs: string[] = []
    let lbxIdx = 0
    function lbxSetMedia(src: string) {
      const img = document.getElementById('lbx-img') as HTMLImageElement
      const vid = document.getElementById('lbx-vid') as HTMLVideoElement
      const isVid = /\.(mp4|mov|webm)$/i.test(src)
      if (isVid) {
        img.style.display = 'none'
        vid.style.display = 'block'
        vid.src = src
        vid.play()
      } else {
        vid.pause()
        vid.style.display = 'none'
        img.style.display = 'block'
        img.src = src
      }
    }
    function lbxOpen(imgs: string[], i: number) {
      lbxImgs = imgs
      lbxIdx = i
      lbxSetMedia(lbxImgs[i])
      document.getElementById('lbx')!.classList.add('on')
      document.body.style.overflow = 'hidden'
    }
    function lbxClose() {
      const vid = document.getElementById('lbx-vid') as HTMLVideoElement
      vid?.pause()
      document.getElementById('lbx')?.classList.remove('on')
      document.body.style.overflow = ''
    }
    function lbxNav(d: number) {
      lbxIdx = (lbxIdx + d + lbxImgs.length) % lbxImgs.length
      lbxSetMedia(lbxImgs[lbxIdx])
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
    function resetQrs() {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = '<button class="qr" onclick="window.__qrTeam(\'book\')">Book Appointment</button><button class="qr" onclick="window.__qrTeam(\'svc\')">View Services</button><button class="qr" onclick="window.__qrTeam(\'hrs\')">Hours & Location</button>'
    }
    function qr(t: string) {
      const el = document.getElementById('qrs')
      if (el) el.innerHTML = ''
      if (t === 'book') { usrMsg('Book an appointment'); setTimeout(() => { botMsg('Head over to our <a href="/book">booking page</a> or call <a href="tel:9284863524">(928) 486-3524</a>.'); resetQrs() }, 500) }
      else if (t === 'svc') { usrMsg('View Services'); setTimeout(() => { botMsg('See our full menu on the <a href="/services">services page</a>.'); resetQrs() }, 500) }
      else if (t === 'hrs') { usrMsg('Hours & Location'); setTimeout(() => { botMsg('2120 McCulloch Blvd N, Suite 103, Lake Havasu City, AZ<br>Mon–Sat: 9 AM – 7 PM · Sun: 10 AM – 5 PM<br><a href="tel:9284863524">(928) 486-3524</a>'); resetQrs() }, 500) }
    }
    function sendMsg() {
      const inp = document.getElementById('cinp') as HTMLInputElement
      const t = inp?.value.trim(); if (!t) return
      usrMsg(t); inp.value = ''
      setTimeout(() => { botMsg("For fastest service call <a href='tel:9284863524'>(928) 486-3524</a>"); resetQrs() }, 700)
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

  return (
    <div className="mkt">
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="logo"><img src="/the nail nook logo.png" alt="The Nail Nook & More" className="nav-logo-img"/></Link>
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
        <h1 className="pg-title" style={{animation:'mktFadeUp .7s .15s ease both'}}>Our Specialists</h1>
        <p className="pg-sub" style={{animation:'mktFadeUp .7s .3s ease both'}}>Our passionate artists dedicated to making your nails a work of art. Each with their own signature style, specialty, and love for the craft.</p>
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
            const displayImgs = sp.photos.length ? sp.photos : galImgs
            return (
              <div key={sp.name} className="sc rv" style={{transitionDelay: `${si * 0.06}s`}}>
                <div className="sc-top">
                  <img
                    src={sp.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(sp.name)}&background=${sp.bg}&color=${sp.fg}&size=400&bold=true`}
                    alt={sp.name}
                    loading="lazy"
                    style={sp.imgPos ? {objectPosition: sp.imgPos} : undefined}
                  />
                  {sp.badge && <span className="sc-badge">{sp.badge}</span>}
                </div>
                <div className="sc-body">
                  <h3>{sp.name}</h3>
                  <span className="sc-role">{sp.spec}</span>
                  <a className="sc-phone" href={`tel:${sp.phone.replace(/\D/g,'')}`}>{sp.phone}</a>
                  <div style={{display:'flex',justifyContent:'center',marginTop:'12px',marginBottom:'12px'}}>
                    {(sp as any).bookingLink
                      ? <a className="btn btn-p btn-specialist" href={(sp as any).bookingLink} target="_blank" rel="noopener noreferrer">Book Now</a>
                      : <Link className="btn btn-p btn-specialist" href="/book">Book Now</Link>
                    }
                  </div>
                  <div className="sc-gal">
                    {displayImgs.slice(0, (sp as any).showCount ?? displayImgs.length).map((u, i) => {
                      const isVideo = /\.(mp4|mov|webm)$/i.test(u)
                      return isVideo ? (
                        <video
                          key={i}
                          src={u}
                          muted
                          playsInline
                          preload="metadata"
                          style={{objectFit:'cover',cursor:'pointer'}}
                          onClick={(e) => { e.stopPropagation(); (window as any).__lbxOpenTeam?.(displayImgs, i) }}
                        />
                      ) : (
                        <img
                          key={i}
                          src={u}
                          alt={`Work sample ${i + 1}`}
                          loading="lazy"
                          onClick={(e) => { e.stopPropagation(); (window as any).__lbxOpenTeam?.(displayImgs, i) }}
                        />
                      )
                    })}
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
        <img id="lbx-img" src="data:," alt="Work sample"/>
        <video id="lbx-vid" controls autoPlay loop muted playsInline style={{display:'none',maxHeight:'90vh',maxWidth:'90vw',borderRadius:'8px'}} onClick={(e) => e.stopPropagation()}/>
        <button className="lbx-nav lbx-next" onClick={(e) => { e.stopPropagation(); (window as any).__lbxNavTeam?.(1) }}>›</button>
      </div>
    </div>
  )
}
