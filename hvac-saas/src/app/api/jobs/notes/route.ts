import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function getTenantId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user.id).single()
  return profile?.tenant_id ?? null
}

export async function GET(request: NextRequest) {
  const tenantId = await getTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = request.nextUrl.searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data: notes, error } = await supabase
    .from('job_notes')
    .select('id, body, created_at')
    .eq('job_id', jobId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes })
}

export async function POST(request: NextRequest) {
  const tenantId = await getTenantId()
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobId, body } = await request.json() as { jobId: string; body: string }
  if (!jobId || !body?.trim()) return NextResponse.json({ error: 'jobId and body required' }, { status: 400 })

  const supabase = await createAdminClient()

  // Verify job belongs to tenant
  const { data: job } = await supabase
    .from('jobs').select('id').eq('id', jobId).eq('tenant_id', tenantId).maybeSingle()
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const { data: note, error } = await supabase
    .from('job_notes')
    .insert({ tenant_id: tenantId, job_id: jobId, body: body.trim() })
    .select('id, body, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note })
}
