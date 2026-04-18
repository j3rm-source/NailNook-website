import bcrypt from 'bcryptjs'
import type { Session } from './types'

const SALT_ROUNDS = 10
const COOKIE_NAME = 'session'

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

export function buildSessionCookieValue(session: Session): string {
  return JSON.stringify(session)
}

export function parseSessionCookie(value: string | undefined): Session | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (parsed?.staffId && parsed?.role) return parsed as Session
    return null
  } catch {
    return null
  }
}

export { COOKIE_NAME }
