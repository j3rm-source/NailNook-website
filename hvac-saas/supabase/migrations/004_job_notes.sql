-- Job notes / timeline
-- Run in Supabase Dashboard → SQL Editor
create table if not exists public.job_notes (
  id         uuid primary key default uuid_generate_v4(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists job_notes_job_id_idx on public.job_notes(job_id);
create index if not exists job_notes_tenant_id_idx on public.job_notes(tenant_id);

-- RLS
alter table public.job_notes enable row level security;

create policy "tenant isolation" on public.job_notes
  using (tenant_id = (
    select tenant_id from public.user_profiles where id = auth.uid()
  ));
