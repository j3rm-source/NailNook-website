import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'J2 Systems — Automated Systems. Real Results.',
    template: '%s | J2 Systems',
  },
  description:
    'All-in-one platform for HVAC and plumbing businesses. CRM, booking, AI receptionist, SMS follow-ups, and your own professional website.',
  keywords: ['HVAC software', 'plumbing CRM', 'field service management', 'AI receptionist', 'SMS follow-up'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'J2 Systems',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
