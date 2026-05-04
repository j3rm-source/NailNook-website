-- Add Cal.com booking link to tenants
-- Run in Supabase Dashboard → SQL Editor
alter table public.tenants
  add column if not exists calcom_link text;
