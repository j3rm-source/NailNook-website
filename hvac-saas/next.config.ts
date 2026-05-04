import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Auth and dashboard pages — never embeddable
        source: '/(login|signup|dashboard)(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Tenant public pages — allow same-origin iframe (dashboard preview)
        source: '/:tenant((?!api|dashboard|login|signup|onboarding)[^/]+)(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

export default nextConfig
