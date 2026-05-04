-- AI receptionist configuration per tenant
-- Run in Supabase Dashboard → SQL Editor
alter table public.tenants
  add column if not exists ai_voice           text not null default 'maya',
  add column if not exists ai_greeting        text,
  add column if not exists ai_call_hours      text,
  add column if not exists ai_transfer_number text;
