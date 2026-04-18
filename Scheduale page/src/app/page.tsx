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
    </div>
  )
}
