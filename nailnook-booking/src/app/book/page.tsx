import { BookingFlow } from '@/components/booking/BookingFlow'

export default function BookPage() {
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Nail Nook'
  const tagline = process.env.NEXT_PUBLIC_BUSINESS_TAGLINE ?? 'Luxury Nails. Effortless Beauty.'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <a href="/" className="inline-block mb-4">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto">
              <rect x="10" y="1" width="8" height="5" rx="2.5" fill="#e91e8c"/>
              <path d="M8 6h12l2.5 20H5.5L8 6z" fill="#f9a8c9"/>
              <path d="M8 6h12l1.2 9H6.8L8 6z" fill="#e91e8c" opacity=".55"/>
              <rect x="9.5" y="2.5" width="9" height="2" rx="1" fill="#c2185b"/>
            </svg>
          </a>
          <h1 className="text-3xl font-bold tracking-tight">{businessName}</h1>
          <p className="mt-2 text-white/70 text-sm">{tagline}</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <BookingFlow />
        </div>
      </main>
      <footer className="text-center py-6 text-xs text-gray-400">
        <a href="/" className="hover:text-gray-600 transition-colors">← Back to site</a>
        {' · '}
        <a href="/staff/login" className="hover:text-gray-600 transition-colors">Staff login</a>
        {' · '}
        <a href="/admin" className="hover:text-gray-600 transition-colors">Admin</a>
      </footer>
    </div>
  )
}
