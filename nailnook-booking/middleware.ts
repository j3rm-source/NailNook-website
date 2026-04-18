import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')

  // Protect /staff/dashboard
  if (pathname.startsWith('/staff/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/staff/login', request.url))
    }
    try {
      const session = JSON.parse(sessionCookie.value)
      if (!session?.staffId) {
        return NextResponse.redirect(new URL('/staff/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/staff/login', request.url))
    }
  }

  // Protect /admin — requires admin role
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/staff/login?redirect=/admin', request.url))
    }
    try {
      const session = JSON.parse(sessionCookie.value)
      if (session?.role !== 'admin') {
        return NextResponse.redirect(new URL('/staff/login?redirect=/admin', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/staff/login?redirect=/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/staff/dashboard/:path*', '/admin/:path*'],
}
