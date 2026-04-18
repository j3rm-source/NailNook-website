import { BookingFlow } from '@/components/booking/BookingFlow'

export default function HomePage() {
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Book Now'
  const tagline = process.env.NEXT_PUBLIC_BUSINESS_TAGLINE ?? 'Book your appointment online'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          {/* Logo placeholder */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-white text-2xl font-bold shadow-lg">
            {businessName.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{businessName}</h1>
          <p className="mt-2 text-white/70 text-sm">{tagline}</p>
        </div>
      </header>

      {/* Booking flow */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <BookingFlow />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        <a href="/staff/login" className="hover:text-gray-600 transition-colors">Staff login</a>
        {' · '}
        <a href="/admin" className="hover:text-gray-600 transition-colors">Admin</a>
      </footer>

      {/* Bottom-left logo */}
      <div className="fixed bottom-5 left-5 flex items-center gap-3">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 flex-shrink-0">
          <rect x="10" y="1" width="8" height="5" rx="2.5" fill="#e91e8c"/>
          <path d="M8 6h12l2.5 20H5.5L8 6z" fill="#f9a8c9"/>
          <path d="M8 6h12l1.2 9H6.8L8 6z" fill="#e91e8c" opacity=".55"/>
          <rect x="9.5" y="2.5" width="9" height="2" rx="1" fill="#c2185b"/>
        </svg>
        <div style={{ fontFamily: 'var(--font-pinyon)', color: '#1e1e1e', lineHeight: 1.1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '2.25rem' }}>the</span>
          <span style={{ fontSize: '4.2rem' }}>Nail Nook</span>
        </div>
      </div>
    </div>
  )
}
