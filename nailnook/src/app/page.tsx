'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '@/styles/marketing.css'

const REVIEWS = [
  // a month ago
  {i:'AL',n:'Alison R.',t:'a month ago',q:"Great salon! Got exactly what I needed for my hair. Simple, and super cute beach waves."},
  // 6–7 months ago
  {i:'LF',n:'Linda F.',t:'6 months ago',q:"HIGHLY RECOMMENDED! Stephanie is amazing. She had quite a job to completely remove the old acrylic nail stuff from my nails. She was patient, gentle, and my nails have never looked better."},
  {i:'TL',n:'Tricia L.',t:'7 months ago',q:"My tech is Kattie & she's a pro for sure. She did a hard gel full set with French manicure — OMG I'm so thrilled! Finally a tech that listens to me. She made sure everything looked FABULOUS and the place was very clean."},
  // a year ago
  {i:'CG',n:'Caitlin G.',t:'a year ago',q:"I can't say enough positive things about the Nail Nook! I have been getting my nails done with Stephanie for 6 years and truly look forward to every appointment. My nails last forever, never break and have remained super healthy."},
  {i:'EP',n:'Exit Plan',t:'a year ago',q:"Rita at Nail Nook is amazing! She's not only incredibly talented but also so kind and professional. She went above and beyond to squeeze us in right before Christmas, and we couldn't be happier with the results."},
  {i:'ML',n:'Megan L.',t:'a year ago',q:"Steph does amazing work! My nails are extremely healthy and beautiful. The atmosphere is very comfortable and clean and doesn't reek of hair product like most others. The staff is extremely welcoming — it's everything a salon should be."},
  {i:'JS',n:'Janet S.',t:'a year ago',q:"The Nail Nook is the best full service salon in Lake Havasu! I have my nails, pedi and hair done all in one place! I've been going to Stephanie for 8 years and she is Amazing. I have also had facials, massages, and spray tans."},
  {i:'DS',n:'Diane S.',t:'a year ago',q:"Rita Davenport gave me the best pedi I have ever had in Lake Havasu. She was gentle yet so thorough — my tootsies are in great shape. I feel so lucky to find someone who gives a great spa pedi right here in town."},
  {i:'SS',n:'Stephanie S.',t:'a year ago',q:"I've been getting my nails done at the Nail Nook since 2017. Stephanie has been providing me with quality nails that keep me running back every 3 weeks to freshen them up. She does great work and she's a wonderful lady."},
  {i:'KC',n:'Kortney C.',t:'a year ago',q:"Stephanie and all the girls at the Nail Nook are fabulous! I have been getting my nails done there for 4 years and would never go anywhere else. It's clean, beautiful and everyone is so kind."},
  {i:'BZ',n:'Brooke Z.',t:'a year ago',q:"I've had the most amazing experiences ever since going to Stephanie at The Nail Nook. She is always willing to do any nail design I find, and if I can't figure out what I want she goes above and beyond with her own designs."},
  {i:'DG',n:'Debbie G.',t:'a year ago',q:"Clean, friendly shop offering everything from hair, nails, tanning, eyelashes, facials and skin care. I love my hard gel nails! Five very talented nail artists."},
  {i:'DJ',n:'Deborah G.',t:'a year ago',q:"I've had my nails done at The Nail Nook for several years and will continue. Best nail shop I've ever used. My nails last 3–4 weeks without breaking. Highly recommend!"},
  {i:'JC',n:'Jill C.',t:'a year ago',q:"Best salon in Lake Havasu City. From nails and toes, to lashes and facials — you can find all your beauty needs here."},
  {i:'KP',n:'Kristy P.',t:'a year ago',q:"Stephanie is both an artist and a perfectionist. Her gel manicures are stunning!"},
  {i:'MR',n:'Michille R.',t:'a year ago',q:"Shannon was wonderful! I love my Christmas nails!"},
  {i:'DR',n:'DraGuNGrL',t:'a year ago',q:"We were looking for somebody to cut our frizzy curly hair. Went to see Kathy and she's very sweet and kind. Knowledgeable about hair and has the experience to get it done in a timely fashion."},
  // 2 years ago
  {i:'JH',n:'Jeff H.',t:'2 years ago',q:"A fantastic group of people supplying many different services at one location — friendly, fair, and you will definitely enjoy your visit to the salon."},
  // 3 years ago
  {i:'KH',n:'Kacee H.',t:'3 years ago',q:"Ricci does my hair color and extension installation. My highlights are always done beautifully and make me look and feel amazing. When I have a vision for what I want, she does exactly what I'm looking for."},
  {i:'GA',n:'G.',t:'3 years ago',q:"Kattie did my wedding trial nails and WOW. She exceeded my expectations. Not only is her work amazing but she is the sweetest and made me feel so comfortable during my visit."},
  {i:'CH',n:'Christina',t:'3 years ago',q:"Miss NailsByJudy did an amazing job recreating a nail design with a little personal touch. Absolutely loved them! Very good price too — I recommend anyone in town go there and see her."},
  {i:'SE',n:'Sierra E.',t:'3 years ago',q:"First off this salon is SO cute. Ricci was a pleasure to work with, made booking super easy and was prompt with following up. She exceeded my expectations and achieved exactly what I was looking for."},
  {i:'MC',n:'Michelle C.',t:'3 years ago',q:"Ricci is the absolute best. I have seen multiple stylists before her who could never get my hair to look like I envisioned, but Ricci did it! She is kind, listens to what you want, and truly cares about her work."},
  {i:'KB',n:'Katie B.',t:'3 years ago',q:"When every other salon was booked, they squeezed in two young ladies celebrating a birthday! They were so gentle and sweet. The girls couldn't stop looking at their nails — they did such a good job."},
  {i:'SD',n:'Sayg D.',t:'3 years ago',q:"Ricci did my hair, and I'm absolutely obsessed! She is so kind and professional and listened to my vision. She kept me laughing the whole time and made sure I was comfortable. 10/10 recommend!"},
  {i:'CB',n:'Coree B.',t:'3 years ago',q:"Ricci is amazing, has so much natural talent, and worked wonders on my hair. Absolutely recommend her to anybody looking for an incredibly talented stylist!"},
  {i:'AN',n:'Annie',t:'3 years ago',q:"I will never go to another nail shop again. I got a gift certificate for Nail Nook for my birthday, just used it today with Kattie and I found my new place — she is wonderful wonderful wonderful!"},
  // 4 years ago
  {i:'NM',n:'Nikki M.',t:'4 years ago',q:"Kattie did my nails and was absolutely amazing. She was so sweet and made sure to explain every decision she made and how it would help my nails stay healthy. The salon is very cute too — highly recommend."},
  {i:'SW',n:'Sarah W.',t:'4 years ago',q:"This salon has absolutely everything you could want! The Nail Nook and More definitely take the 'and more' part seriously! They have all your beauty needs in one spot AND a great experience to top it off."},
  {i:'DI',n:'Diana S.',t:'4 years ago',q:"Macy did an amazing job, especially the free hand nail art. The salon is nice and clean and PINK! Highly recommend."},
  // 5 years ago
  {i:'CS',n:'Csmilez S.',t:'5 years ago',q:"Great place to get a manicure and pedicure. The staff is kind and friendly and the place is clean. The prices are awesome. I go every two weeks to get my nails done — I love this place!"},
  {i:'AM',n:'Amanda S.',t:'5 years ago',q:"Nice people! Kattie did my nails and did a wonderful job — couldn't be happier! Would highly recommend!"},
  {i:'AR',n:'Angie R.',t:'5 years ago',q:"I don't trust any other place in Havasu with my nails or my feet. Love them all 10/10."},
  // 6 years ago
  {i:'JR',n:'Jennifer R.',t:'6 years ago',q:"The girls at The Nail Nook are professional, friendly, and talented. I go every two weeks to get my nails done with Janette and she always does an amazing job! Stephanie, Brittany, and Janet also do awesome work. I HIGHLY recommend."},
  {i:'LG',n:'Lindsay G.',t:'6 years ago',q:"Absolutely wonderful staff that put out a beautiful nail product. These girls can do just about everything! I highly recommend them and am happy to refer their business to anyone looking for a reliable, communicative nail salon."},
  {i:'MF',n:'Mellissa F.',t:'6 years ago',q:"Awesome customer service and attention to detail. Great quality pedicures if you're wanting a spa pedicure."},
  {i:'AA',n:'Ashley A.',t:'6 years ago',q:"Such a cute place and all the girls there are so talented. Highly recommend!"},
  {i:'KS',n:'Kylee S.',t:'6 years ago',q:"Stephanie is absolutely amazing! Love her."},
  // 7 years ago
  {i:'SK',n:'Susan K.',t:'7 years ago',q:"I'm from out of town and needed to get my nails done. The reviews on The Nail Nook were outstanding! Omgosh, you need to go there — they are wonderful! Janette did mine and was very thorough."},
  {i:'HC',n:'Heidi C.',t:'7 years ago',q:"Best pedi I've had since moving back to Havasu! Janette is sweet, fun and full of positivity. Her pedi was on point — incredible foot scrub and foot massage. Incredibly relaxing."},
  {i:'CR',n:'Crystal S.',t:'7 years ago',q:"Brytney does a beautiful job and I always have a great time talking with her too. It's a fabulous little shop — kind of hidden but totally worth finding!!!"},
  {i:'LP',n:'Linda P.',t:'7 years ago',q:"New resident of the city and in need of pampering. Found this cute little 'nook' online with great reviews — now I can add to the list! Very friendly and Brytney did a great job and made me feel at home."},
  // 8 years ago
  {i:'MM',n:'Marcie M.',t:'8 years ago',q:"Stephanie is an artist! She knows and skillfully uses amazing techniques to ensure the best manicure and pedicure you will ever have. Look no further!"},
  {i:'JA',n:'Jamie H.',t:'8 years ago',q:"Very clean nail salon with talented girls. The best pedicure chairs!"},
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [revIdx, setRevIdx] = useState(0)
  const [revTick, setRevTick] = useState(0)

  function revNav(d: number) {
    setRevIdx(i => (i + d + REVIEWS.length) % REVIEWS.length)
    setRevTick(t => t + 1)
  }

  useEffect(() => {
    const timer = setInterval(() => setRevIdx(i => (i + 1) % REVIEWS.length), 4000)
    return () => clearInterval(timer)
  }, [revTick])

  useEffect(() => {
    // ---- GALLERY SLIDESHOW ----
    const imgs = [
      '/gallery/IMG_1017.JPEG', // chrome opal almond nails
      '/gallery/IMG_1018.JPEG', // blue ombre glitter coffin
      '/gallery/IMG_1019.JPEG', // silver holographic glitter
      '/gallery/IMG_1046.JPEG', // teal wave French tip
      '/gallery/IMG_1025.JPEG', // classic red almond
      '/gallery/IMG_1052.JPEG', // red with gold gem accent
      '/gallery/IMG_1020.JPEG', // white nude glitter
      '/gallery/IMG_1016.JPEG', // blue/purple floral art
      '/gallery/IMG_1021.JPEG', // Christmas plaid & gems
      '/gallery/IMG_1023.JPEG', // teal + leopard print
      '/gallery/IMG_1026.JPEG', // dark green tortoiseshell
      '/gallery/IMG_1028.JPEG', // colorful tie-dye festival
      '/gallery/IMG_1029.JPEG', // purple marble geode
      '/gallery/IMG_1030.JPEG', // black/white celestial stiletto
      '/gallery/IMG_1031.JPEG', // Halloween green/purple ghost
      '/gallery/IMG_1032.JPEG', // purple celestial moon
      '/gallery/IMG_1033.JPEG', // Halloween red/black drip
      '/gallery/IMG_1034.JPEG', // checkerboard + flames
      '/gallery/IMG_1040.JPEG', // neon yellow 3D floral
      '/gallery/IMG_1041.JPEG', // colorful abstract art
      '/gallery/IMG_1042.JPEG', // patriotic red/white/blue
      '/gallery/IMG_1048.JPEG', // black/green drip with gems
      '/gallery/IMG_1049.JPEG', // Jessica lace floral (@NAILZBYJESSICAA)
      '/gallery/IMG_1051.JPEG', // grey/black glitter hearts
      '/gallery/IMG_1058.JPEG', // colored lash extensions
      '/gallery/IMG_1061.JPEG', // lash extensions (green eye)
      '/gallery/IMG_1062.JPEG', // lash extensions (both eyes)
      '/gallery/IMG_1060.JPEG', // lash before & after
      '/gallery/IMG_1059.JPEG', // brow lamination before & after
      '/gallery/IMG_1035.JPEG', // wavy brown highlights
      '/gallery/IMG_1036.JPEG', // brown balayage
      '/gallery/IMG_1037.JPEG', // silver/ash highlights
      '/gallery/IMG_1038.JPEG', // blonde waves
    ]
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
            {href:'/services#manicure',img:'/gallery/IMG_1020.JPEG',alt:'Manicure',name:'Manicure',desc:'Classic, gel, and spa manicures. Perfectly shaped and polished every time.',from:'From $25',cls:'rv'},
            {href:'/services#pedicure',img:'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&h=450&fit=crop&auto=format',alt:'Pedicure',name:'Pedicure',desc:'Relaxing pedicure treatments from classic to luxurious spa experiences.',from:'From $35',cls:'rv d1'},
            {href:'/services#acrylic',img:'/gallery/IMG_1017.JPEG',alt:'Acrylic Nails',name:'Acrylic Nails',desc:'Long-lasting acrylic extensions for a glamorous, durable finish.',from:'From $55',cls:'rv d2'},
            {href:'/services#gel',img:'/gallery/IMG_1018.JPEG',alt:'Gel Extensions',name:'Gel Extensions',desc:'Lightweight, flexible gel extensions with a natural look and feel.',from:'From $65',cls:'rv d3'},
            {href:'/services#lashes',img:'/gallery/IMG_1061.JPEG',alt:'Eyelash Extensions',name:'Eyelash Extensions',desc:'Lush, full lash extensions for a wide-awake look that lasts weeks.',from:'From $75',cls:'rv d4'},
            {href:'/services#art',img:'/gallery/IMG_1030.JPEG',alt:'Nail Art',name:'Nail Art',desc:'Custom designs, gems, chrome, ombre, and hand-painted artwork.',from:'From $5',cls:'rv d5'},
            {href:'/services#waxing',img:'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&h=450&fit=crop&auto=format',alt:'Waxing',name:'Waxing',desc:'Smooth, precise waxing for eyebrows, lips, face, and more.',from:'From $10',cls:'rv'},
            {href:'/services#permmakeup',img:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=450&fit=crop&auto=format',alt:'Permanent Makeup',name:'Permanent Makeup',desc:'Flawless brows, liner, and lips that look perfect every single morning.',from:'From $150',cls:'rv d1'},
            {href:'/services#botox',img:'/gallery/IMG_1054.JPEG',alt:'Botox',name:'Botox',desc:'Smooth fine lines and refresh your look with expert cosmetic injections.',from:'Call for pricing',cls:'rv d2'},
            {href:'/services#massage',img:'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=450&fit=crop&auto=format',alt:'Massage',name:'Massage',desc:'Relaxing therapeutic massage to melt away tension from head to toe.',from:'From $60',cls:'rv d3'},
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
          <h2 className="sec-title">Serving Havasu for 9+ Years</h2>
          <p className="sec-sub">Don&apos;t take our word for it — here&apos;s what your neighbors are saying.</p>
        </div>
        <div className="rev-wrap">
          <button className="rev-btn rev-prev" onClick={() => revNav(-1)} aria-label="Previous review">‹</button>
          <div className="rev-slider">
            <div className="rev-track" style={{ transform: `translateX(-${revIdx * 100}%)` }}>
              {REVIEWS.map(r => (
                <div key={r.n} className="rev-card">
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
          </div>
          <button className="rev-btn rev-next" onClick={() => revNav(1)} aria-label="Next review">›</button>
          <div className="rev-dots">
            {REVIEWS.map((_, i) => (
              <button key={i} className={`ss-dot${i === revIdx ? ' on' : ''}`} onClick={() => { setRevIdx(i); setRevTick(t => t + 1) }} aria-label={`Review ${i + 1}`}/>
            ))}
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:'36px'}}>
          <Link href="/book" className="btn btn-p">Book Now</Link>
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
        <img id="lbx-img" src="data:," alt="Nail art"/>
        <button className="lbx-nav lbx-next" onClick={(e) => { e.stopPropagation(); (window as any).__lbxNav?.(1) }}>›</button>
      </div>
    </div>
  )
}
