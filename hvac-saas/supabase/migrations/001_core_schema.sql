-- ============================================================
-- TradeDesk — Core Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TENANTS
-- One row per client business
-- ============================================================
create table public.tenants (
  id                        uuid primary key default uuid_generate_v4(),
  created_at                timestamptz not null default now(),
  business_name             text not null,
  plan_tier                 smallint not null default 1 check (plan_tier in (1, 2, 3)),
  stripe_customer_id        text unique,
  stripe_subscription_id    text unique,
  stripe_subscription_status text,
  twilio_number             text,
  area_code                 text,
  google_review_link        text,
  website_slug              text unique,
  -- Website customization
  primary_color             text not null default '#2563eb',
  logo_url                  text,
  tagline                   text,
  services                  text[] not null default '{}',
  about_text                text
);

-- ============================================================
-- USER PROFILES
-- Extends Supabase auth.users with tenant linkage
-- ============================================================
create table public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'owner' check (role in ('owner', 'staff')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CONTACTS
-- Leads and customers
-- ============================================================
create table public.contacts (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  created_at  timestamptz not null default now(),
  first_name  text not null,
  last_name   text,
  phone       text,
  email       text,
  source      text not null default 'manual'
              check (source in ('website_form','ai_call','sms_reply','manual','cal_booking')),
  status      text not null default 'new'
              check (status in ('new','contacted','qualified','booked','won','lost')),
  notes       text,
  address     text,
  issue_type  text
);

-- ============================================================
-- JOBS
-- Pipeline from new → completed
-- ============================================================
create table public.jobs (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  contact_id      uuid not null references public.contacts(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  title           text not null,
  status          text not null default 'new'
                  check (status in ('new','quoted','scheduled','in_progress','completed','cancelled')),
  description     text,
  quoted_amount   integer,   -- in cents
  invoice_amount  integer,   -- in cents
  scheduled_at    timestamptz,
  completed_at    timestamptz
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ============================================================
-- BOOKINGS
-- Linked to jobs + Cal.com
-- ============================================================
create table public.bookings (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  job_id            uuid references public.jobs(id) on delete set null,
  contact_id        uuid not null references public.contacts(id) on delete cascade,
  calcom_booking_id text unique,
  created_at        timestamptz not null default now(),
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  status            text not null default 'upcoming'
                    check (status in ('upcoming','completed','cancelled'))
);

-- ============================================================
-- SMS TEMPLATES
-- Per-tenant, 3 sequence positions
-- ============================================================
create table public.sms_templates (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  sequence_position smallint not null check (sequence_position in (0, 1, 2)),
  body              text not null,
  delay_hours       integer not null default 0,
  unique (tenant_id, sequence_position)
);

-- ============================================================
-- SMS SEQUENCES
-- Tracks active follow-up sequences per contact
-- ============================================================
create table public.sms_sequences (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  contact_id      uuid not null references public.contacts(id) on delete cascade,
  bullmq_job_ids  text[] not null default '{}',
  status          text not null default 'active'
                  check (status in ('active','cancelled','completed')),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- AI CALLS
-- Bland AI call transcripts and outcomes
-- ============================================================
create table public.ai_calls (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  contact_id       uuid references public.contacts(id) on delete set null,
  created_at       timestamptz not null default now(),
  caller_phone     text not null,
  duration_seconds integer,
  outcome          text not null default 'other'
                   check (outcome in ('booked','follow_up_sent','no_answer','other')),
  transcript       text,
  summary          text,
  bland_call_id    text unique not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Each tenant only sees their own rows
-- ============================================================

alter table public.tenants        enable row level security;
alter table public.user_profiles  enable row level security;
alter table public.contacts       enable row level security;
alter table public.jobs           enable row level security;
alter table public.bookings       enable row level security;
alter table public.sms_templates  enable row level security;
alter table public.sms_sequences  enable row level security;
alter table public.ai_calls       enable row level security;

-- Helper function: get current user's tenant_id from their profile
create or replace function public.my_tenant_id()
returns uuid language sql stable security definer as $$
  select tenant_id from public.user_profiles where id = auth.uid();
$$;

-- RLS policies

-- tenants: users can only read/update their own tenant
create policy "tenant_select" on public.tenants
  for select using (id = public.my_tenant_id());
create policy "tenant_update" on public.tenants
  for update using (id = public.my_tenant_id());

-- user_profiles
create policy "profile_select" on public.user_profiles
  for select using (tenant_id = public.my_tenant_id());
create policy "profile_update" on public.user_profiles
  for update using (id = auth.uid());

-- contacts
create policy "contacts_all" on public.contacts
  for all using (tenant_id = public.my_tenant_id());

-- jobs
create policy "jobs_all" on public.jobs
  for all using (tenant_id = public.my_tenant_id());

-- bookings
create policy "bookings_all" on public.bookings
  for all using (tenant_id = public.my_tenant_id());

-- sms_templates
create policy "sms_templates_all" on public.sms_templates
  for all using (tenant_id = public.my_tenant_id());

-- sms_sequences
create policy "sms_sequences_all" on public.sms_sequences
  for all using (tenant_id = public.my_tenant_id());

-- ai_calls
create policy "ai_calls_all" on public.ai_calls
  for all using (tenant_id = public.my_tenant_id());

-- ============================================================
-- DEFAULT SMS TEMPLATES (inserted by service-role on tenant create)
-- These are the defaults; tenants can override them.
-- ============================================================
-- (Inserted via API on tenant creation — see /api/stripe/webhook)

-- ============================================================
-- INDEXES for common queries
-- ============================================================
create index contacts_tenant_id_idx    on public.contacts(tenant_id);
create index contacts_status_idx       on public.contacts(status);
create index jobs_tenant_id_idx        on public.jobs(tenant_id);
create index jobs_status_idx           on public.jobs(status);
create index ai_calls_tenant_id_idx    on public.ai_calls(tenant_id);
create index sms_sequences_contact_idx on public.sms_sequences(contact_id);
