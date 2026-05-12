import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { parseSessionCookie } from '@/lib/auth'

export const runtime = 'nodejs'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const raw = request.cookies.get('session')?.value
  const session = parseSessionCookie(raw)

  if (pathname.startsWith('/staff/dashboard')) {
    if (!session?.staffId) {
      return NextResponse.redirect(new URL('/staff/login', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (session?.role !== 'admin') {
      return NextResponse.redirect(new URL('/staff/login?redirect=/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/staff/dashboard/:path*', '/admin/:path*'],
}
