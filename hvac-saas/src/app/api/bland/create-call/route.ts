import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateBlandScript } from '@/lib/bland-script'
import type { Tenant } from '@/lib/types'

export async function POST(request: NextRequest) {
  // Auth — derive tenantId from session, never trust the request body
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseUser
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { callerPhone } = await request.json() as { callerPhone: string }

  if (!callerPhone) {
    return NextResponse.json({ error: 'callerPhone is required' }, { status: 400 })
  }

  // Basic E.164 validation: +<country code><number>, 8–15 digits total
  if (!/^\+[1-9]\d{7,14}$/.test(callerPhone)) {
    return NextResponse.json({ error: 'callerPhone must be in E.164 format (e.g. +15551234567)' }, { status: 400 })
  }

  const tenantId = profile.tenant_id
  const supabase = await createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tradedesk.io'
  const bookingLink = tenant.website_slug
    ? `${appUrl}/${tenant.website_slug}`
    : appUrl

  const script = generateBlandScript(tenant as Tenant, bookingLink)

  const response = await fetch('https://api.bland.ai/v1/calls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.BLAND_AI_API_KEY}`,
    },
    body: JSON.stringify({
      phone_number: callerPhone,
      task: script,
      voice: tenant.ai_voice ?? 'maya',
      reduce_latency: true,
      record: true,
      webhook: `${appUrl}/api/bland/webhook?tenant_id=${tenantId}`,
      metadata: { tenant_id: tenantId },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Bland AI call failed:', err)
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 502 })
  }

  const data = await response.json()
  return NextResponse.json({ call_id: data.call_id })
}
