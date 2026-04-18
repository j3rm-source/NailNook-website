import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Book Now',
  description: process.env.NEXT_PUBLIC_BUSINESS_TAGLINE ?? 'Book your appointment online',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-gray-50 font-sans">{children}</body>
    </html>
  )
}
