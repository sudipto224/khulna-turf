-- ─────────────────────────────────────────────────────────────
-- Khulna Turf — Public read on blocked_slots (v1).
-- Run this in the Supabase Dashboard → SQL Editor BEFORE testing
-- the customer-facing blocked slots.
-- Re-runnable: DROP ... IF EXISTS guards the CREATE POLICY.
-- blocked_slots holds no personal data (only ground, date, slot,
-- reason), so public SELECT is safe.
-- The admin ALL policy ("Admins all on blocked_slots") already
-- exists in admin-policies.sql and is left unchanged.
-- ─────────────────────────────────────────────────────────────

drop policy if exists "public read blocked_slots" on public.blocked_slots;
create policy "public read blocked_slots" on public.blocked_slots for select using (true);
