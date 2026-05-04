-- Lead qualification score (1–10) on contacts, populated from AI call transcript
-- Run in Supabase Dashboard → SQL Editor
alter table public.contacts
  add column if not exists lead_score smallint check (lead_score between 1 and 10);
