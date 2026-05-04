import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const callId = request.nextUrl.searchParams.get('callId')
  if (!callId) return NextResponse.json({ error: 'callId required' }, { status: 400 })

  // Verify this call belongs to the user's tenant
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: call } = await supabase
    .from('ai_calls')
    .select('id')
    .eq('bland_call_id', callId)
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle()

  if (!call) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const res = await fetch(`https://api.bland.ai/v1/calls/${callId}`, {
    headers: { Authorization: process.env.BLAND_AI_API_KEY! },
  })

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch from Bland' }, { status: 502 })

  const data = await res.json()
  const url: string | null = data.recording_url ?? null

  return NextResponse.json({ url })
}
