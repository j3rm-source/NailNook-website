import type { Metadata } from 'next'
import { Playfair_Display, Lato, Great_Vibes, Pinyon_Script } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-great-vibes',
  display: 'swap',
})

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon',
  display: 'swap',
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Nail Nook',
  description: process.env.NEXT_PUBLIC_BUSINESS_TAGLINE ?? 'Luxury Nails. Effortless Beauty.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable} ${greatVibes.variable} ${pinyonScript.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">{children}</body>
    </html>
  )
}
