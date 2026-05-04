const store = new Map<string, { count: number; resetAt: number }>()

// Prune old entries every 5 minutes to prevent unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { ok: true, remaining: limit - entry.count, retryAfterMs: 0 }
}
