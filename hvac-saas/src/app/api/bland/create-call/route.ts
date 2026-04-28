import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateBlandScript } from '@/lib/bland-script'
import type { Tenant } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { callerPhone, tenantId } = await request.json() as {
    callerPhone: string
    tenantId: string
  }

  if (!callerPhone || !tenantId) {
    return NextResponse.json({ error: 'callerPhone and tenantId are required' }, { status: 400 })
  }

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
      Authorization: process.env.BLAND_AI_API_KEY!,
    },
    body: JSON.stringify({
      phone_number: callerPhone,
      task: script,
      voice: 'maya',
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
