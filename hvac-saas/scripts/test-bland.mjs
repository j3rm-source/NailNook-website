#!/usr/bin/env node
/**
 * Bland AI test script
 * Usage:
 *   node scripts/test-bland.mjs                        -- verify API key works
 *   node scripts/test-bland.mjs +1XXXXXXXXXX           -- make a test call to a number
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = resolve(__dirname, '../.env.local')
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
}

const API_KEY = env.BLAND_AI_API_KEY
const APP_URL = env.NEXT_PUBLIC_APP_URL ?? 'https://tradedesk.io'

if (!API_KEY) {
  console.error('❌ BLAND_AI_API_KEY is empty in .env.local — add it first.')
  process.exit(1)
}

async function blandFetch(path, options = {}) {
  const res = await fetch(`https://api.bland.ai${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY,
      ...options.headers,
    },
  })
  const text = await res.text()
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) } }
  catch { return { ok: res.ok, status: res.status, data: text } }
}

// --- Verify API key ---
console.log('\n🔑 Verifying Bland AI API key...')
const me = await blandFetch('/v1/me')
if (!me.ok) {
  console.error(`❌ Auth failed (${me.status}):`, me.data)
  process.exit(1)
}
console.log('✅ API key valid.')
console.log('   Account:', me.data?.user?.email ?? JSON.stringify(me.data))

// --- List available voices ---
console.log('\n🎙️  Available voices:')
const voices = await blandFetch('/v1/voices')
if (voices.ok && Array.isArray(voices.data?.voices)) {
  for (const v of voices.data.voices.slice(0, 8)) {
    console.log(`   - ${v.name} (${v.id})`)
  }
} else {
  console.log('   (could not fetch voices)')
}

// --- Test call (optional) ---
const phone = process.argv[2]
if (!phone) {
  console.log('\n💡 To make a test call, run:')
  console.log('   node scripts/test-bland.mjs +1XXXXXXXXXX')
  process.exit(0)
}

console.log(`\n📞 Initiating test call to ${phone}...`)
const call = await blandFetch('/v1/calls', {
  method: 'POST',
  body: JSON.stringify({
    phone_number: phone,
    task: `You are a friendly receptionist test bot. Say hello, mention this is a TradeDesk AI receptionist test call, ask the person to say "test complete" to confirm the call is working, then politely end the call. Keep it under 30 seconds.`,
    voice: 'maya',
    reduce_latency: true,
    record: false,
    webhook: `${APP_URL}/api/bland/webhook?tenant_id=test`,
  }),
})

if (call.ok) {
  console.log('✅ Call initiated. Call ID:', call.data?.call_id)
  console.log('   You should receive a call within ~10 seconds.')
} else {
  console.error(`❌ Call failed (${call.status}):`, call.data)
}
