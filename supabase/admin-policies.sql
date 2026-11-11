-- ─────────────────────────────────────────────────────────────
-- Khulna Turf — Admin RLS policies (v1).
-- Run this in the Supabase Dashboard → SQL Editor.
-- Re-runnable: every CREATE POLICY is guarded by IF NOT EXISTS.
-- ─────────────────────────────────────────────────────────────

-- Ensure RLS is enabled on each table (idempotent).
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.settings enable row level security;

-- (a) Admins read all bookings
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'bookings'
      and policyname = 'Admins read all bookings'
  ) then
    create policy "Admins read all bookings"
      on public.bookings
      for select
      using ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' );
  end if;
end $$;

-- (b) Admins update bookings
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'bookings'
      and policyname = 'Admins update bookings'
  ) then
    create policy "Admins update bookings"
      on public.bookings
      for update
      using ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' )
      with check ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' );
  end if;
end $$;

-- (c) Admins read payments
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments'
      and policyname = 'Admins read payments'
  ) then
    create policy "Admins read payments"
      on public.payments
      for select
      using ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' );
  end if;
end $$;

-- (d) Admin ALL (SELECT/INSERT/UPDATE/DELETE) on blocked_slots
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'blocked_slots'
      and policyname = 'Admins all on blocked_slots'
  ) then
    create policy "Admins all on blocked_slots"
      on public.blocked_slots
      for all
      using ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' )
      with check ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' );
  end if;
end $$;

-- (e) Admins update settings
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings'
      and policyname = 'Admins update settings'
  ) then
    create policy "Admins update settings"
      on public.settings
      for update
      using ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' )
      with check ( (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true' );
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- ONE-TIME: flag the admin Auth user (run ONCE, after creating
-- the admin user in Supabase Dashboard → Authentication → Users →
-- Add user, email admin@khulnaturf.com, password of your choice).
-- Uncomment the line below and run it in the SQL Editor:
--
-- update auth.users
-- set raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
-- where email = 'admin@khulnaturf.com';
--
-- NOTE: raw_user_meta_data is visible in JWT user_metadata (client-side).
-- Use this only for the admin flag; do not store secrets here.
-- ─────────────────────────────────────────────────────────────
