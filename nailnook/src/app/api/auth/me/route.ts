import { NextRequest, NextResponse } from 'next/server'
import { parseSessionCookie, COOKIE_NAME } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)
  const session = parseSessionCookie(cookie?.value)

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json(session)
}
