import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SwRegister from './_components/sw-register'
import IosInstallBanner from './_components/ios-install-banner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#00d4b8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'J2 Systems — Automated Systems. Real Results.',
    template: '%s | J2 Systems',
  },
  description:
    'All-in-one platform for HVAC and plumbing businesses. CRM, booking, AI receptionist, SMS follow-ups, and your own professional website.',
  keywords: ['HVAC software', 'plumbing CRM', 'field service management', 'AI receptionist', 'SMS follow-up'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'J2 Systems',
  },
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
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased">
        {children}
        <SwRegister />
        <IosInstallBanner />
      </body>
    </html>
  )
}
