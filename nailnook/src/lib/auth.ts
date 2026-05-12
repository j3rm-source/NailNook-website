import bcrypt from 'bcryptjs'
import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import type { Session } from './types'

const SALT_ROUNDS = 10
const COOKIE_NAME = 'session'
const SECRET = process.env.COOKIE_SECRET || 'dev-secret-change-in-production'

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

function sign(payload: string): string {
  const encoded = Buffer.from(payload).toString('base64url')
  const mac = createHmac('sha256', SECRET).update(encoded).digest('base64url')
  return `${encoded}.${mac}`
}

function verifyAndDecode(signed: string): string | null {
  const dotIdx = signed.lastIndexOf('.')
  if (dotIdx === -1) return null
  const encoded = signed.slice(0, dotIdx)
  const sig = signed.slice(dotIdx + 1)
  const expected = createHmac('sha256', SECRET).update(encoded).digest('base64url')
  try {
    const sigBuf = Buffer.from(sig, 'base64url')
    const expBuf = Buffer.from(expected, 'base64url')
    if (sigBuf.length !== expBuf.length) return null
    if (!timingSafeEqual(sigBuf, expBuf)) return null
  } catch {
    return null
  }
  return Buffer.from(encoded, 'base64url').toString()
}

export function buildSessionCookieValue(session: Session): string {
  return sign(JSON.stringify(session))
}

export function parseSessionCookie(value: string | undefined): Session | null {
  if (!value) return null
  const payload = verifyAndDecode(value)
  if (!payload) return null
  try {
    const parsed = JSON.parse(payload)
    if (parsed?.staffId && parsed?.role) return parsed as Session
    return null
  } catch {
    return null
  }
}

export function requireAdmin(request: NextRequest): Session | null {
  const raw = request.cookies.get(COOKIE_NAME)?.value
  const session = parseSessionCookie(raw)
  if (!session || session.role !== 'admin') return null
  return session
}

export { COOKIE_NAME }
