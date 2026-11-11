-- ─────────────────────────────────────────────────────────────
-- Khulna Turf — Supabase schema (v3, updated 2026-11-11)
-- Matches the LIVE database exactly: one ground ("Ground"),
-- Gollamari address, 50% advance only, CCTV Footage facility
-- (no Gaming Zone, no Ground B), get_booked_slots() RPC,
-- admin RLS policies (is_admin), public read on blocked_slots.
--
-- How to use:
--   FRESH project: Dashboard → SQL Editor → এই পুরো ফাইল paste
--   করে Run করো। তারপর Authentication → Email → "Confirm email"
--   OFF করো, আর Settings → API থেকে Project URL + anon key নিয়ে
--   .env.local / Vercel env vars-এ বসাও:
--      NEXT_PUBLIC_SUPABASE_URL আর NEXT_PUBLIC_SUPABASE_ANON_KEY
--   EXISTING project (যেমন khulna-turf): পুরো ফাইল আবার চালানো
--   নিরাপদ — সব statement IF NOT EXISTS / DROP IF EXISTS /
--   ON CONFLICT দিয়ে guarded, তাই কিছু ডাবল হবে না।
--
-- Admin user setup (one-time, SQL Editor-এ আলাদা করে চালাতে হয়):
--   1. Dashboard → Authentication → Users → Add user:
--      email admin@khulnaturf.com, নিজের পছন্দের পাসওয়ার্ড
--   2. তারপর নিচের লাইনটা চালাও (নিচে comment করা আছে):
--      update auth.users set raw_user_meta_data =
--        raw_user_meta_data || '{"is_admin": true}'::jsonb
--        where email = 'admin@khulnaturf.com';
--   3. /admin থেকে লগআউট করে আবার লগইন করো (নতুন JWT-তে
--      is_admin আসবে, নইলে RLS বুকিং লুকিয়ে রাখবে)।
-- ─────────────────────────────────────────────────────────────

-- Grounds (matches lib/data.ts GROUNDS)
create table if not exists public.grounds (
  id text primary key,
  name text not null,
  format text not null,
  size text,
  surface text,
  capacity text,
  floodlight boolean default true,
  description text,
  facilities text[] default '{}',
  created_at timestamptz default now()
);

-- Bookings (slot_indices = 90-min slot indices 0–15, see lib/data.ts)
-- user_id = the booking owner's id (Supabase Auth user id, or the
-- user's phone in demo mode) — so each user only sees their own bookings.
create table if not exists public.bookings (
  id text primary key,
  ground_id text not null references public.grounds (id),
  date date not null,
  slot_indices int[] not null default '{}',
  name text not null,
  phone text not null,
  team text default '—',
  total int not null default 0,
  advance int not null default 0,
  due int not null default 0,
  advance_method text default '',
  status text not null default 'pending'
    check (status in ('confirmed', 'pending', 'paid', 'cancelled')),
  user_id text,
  created_at timestamptz default now()
);
create index if not exists bookings_ground_date_idx
  on public.bookings (ground_id, date);
create index if not exists bookings_user_idx
  on public.bookings (user_id);

-- Blocked slots (maintenance): one row per blocked ground+date+slot
create table if not exists public.blocked_slots (
  id bigint generated always as identity primary key,
  ground_id text not null references public.grounds (id),
  date date not null,
  slot_index int not null,
  reason text default 'Maintenance',
  created_at timestamptz default now(),
  unique (ground_id, date, slot_index)
);

-- Payments (one row per payment attempt; tran_id = booking id)
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  tran_id text not null,
  booking_id text references public.bookings (id),
  amount int not null,
  method text,
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed', 'cancelled')),
  val_id text,
  created_at timestamptz default now()
);
create index if not exists payments_tran_idx on public.payments (tran_id);

-- Settings (single row, id = 1; edited from /admin/settings)
create table if not exists public.settings (
  id int primary key,
  turf_name text not null default 'Khulna Turf',
  address text,
  phone text,
  peak_per_slot int default 1200,
  off_peak_per_slot int default 800,
  updated_at timestamptz default now()
);

-- Seed the single ground + settings (sizes/prices are placeholders
-- until the owner confirms the real dimensions and prices)
insert into public.grounds (id, name, format, size, surface, capacity, floodlight, description, facilities)
values
  ('ground-a', 'Ground', '7-a-side', '40m × 25m', 'Premium Astroturf', '14 players', true,
   'খুলনা টার্ফের বড় মাঠ — ৭-এ-সাইড ম্যাচ, টুর্নামেন্ট আর বড় টিমের জন্য সেরা। রাতে ফ্লাডলাইটে খেলার অভিজ্ঞতা একদম প্রফেশনাল।',
   array['Floodlight','Astroturf','Parking','Washroom','Changing Room','Drinking Water','Cafeteria','Gallery','CCTV Footage','Cricket','Football','Swimming Pool Package'])
on conflict (id) do update set
  name = excluded.name,
  format = excluded.format,
  size = excluded.size,
  surface = excluded.surface,
  capacity = excluded.capacity,
  description = excluded.description,
  facilities = excluded.facilities;

insert into public.settings (id, turf_name, address, phone, peak_per_slot, off_peak_per_slot)
values (1, 'Khulna Turf', '40-41, M A Bari Road, Gollamari Sonadanga Link Road, 9100, Khulna, Bangladesh',
        '01407-505404', 1200, 800)
on conflict (id) do update set
  address = excluded.address,
  phone = excluded.phone,
  peak_per_slot = excluded.peak_per_slot,
  off_peak_per_slot = excluded.off_peak_per_slot;

-- ── Booked-slot lookup (no private data) ───────────────────────
-- Guests must be able to see WHICH slots are taken (for the booking
-- calendar) without seeing anyone's name/phone. This function returns
-- only the booked slot indices for one ground + date, excluding
-- cancelled bookings. lib/db.ts calls it for availability.
create or replace function public.get_booked_slots(p_ground text, p_date date)
returns int[]
language sql
security definer
stable
as $$
  select coalesce(array_agg(distinct s), '{}')
  from public.bookings b, unnest(b.slot_indices) as s
  where b.ground_id = p_ground
    and b.date = p_date
    and b.status <> 'cancelled';
$$;
grant execute on function public.get_booked_slots(text, date) to anon, authenticated;

-- ── Row Level Security ─────────────────────────────────────────
-- anon key দিয়ে যা করা যায়: grounds/settings/blocked_slots পড়া,
-- bookings/payments তৈরি করা (insert), আর get_booked_slots() দিয়ে
-- বুকড স্লট দেখা। লগইন করা ইউজার শুধু নিজের বুকিং পড়তে/বাতিল
-- করতে পারে (user_id = Supabase Auth user id)। অন্যের নাম-ফোন
-- কেউ দেখতে পায় না। Admin (user_metadata.is_admin = true) সব
-- বুকিং পড়তে/বাতিল করতে পারে, payments পড়তে পারে, blocked_slots
-- বদলাতে পারে, আর settings বদলাতে পারে — নিচের policies দেখো।
-- (কোনো public delete policy নেই।)
alter table public.grounds enable row level security;
alter table public.bookings enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.payments enable row level security;
alter table public.settings enable row level security;

drop policy if exists "public read grounds" on public.grounds;
create policy "public read grounds" on public.grounds
  for select using (true);
drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings
  for select using (true);
drop policy if exists "public insert bookings" on public.bookings;
create policy "public insert bookings" on public.bookings
  for insert with check (true);
drop policy if exists "own bookings read" on public.bookings;
create policy "own bookings read" on public.bookings
  for select using (auth.uid()::text = user_id);
drop policy if exists "own bookings update" on public.bookings;
create policy "own bookings update" on public.bookings
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
drop policy if exists "public insert payments" on public.payments;
create policy "public insert payments" on public.payments
  for insert with check (true);
drop policy if exists "public read blocked_slots" on public.blocked_slots;
create policy "public read blocked_slots" on public.blocked_slots
  for select using (true);

-- ── Admin policies (user_metadata.is_admin = true) ─────────────
-- Guarded with IF NOT EXISTS, so re-running this file is safe.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Admins read all bookings') then
    create policy "Admins read all bookings" on public.bookings
      for select using ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Admins update bookings') then
    create policy "Admins update bookings" on public.bookings
      for update using ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true')
      with check ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'Admins read payments') then
    create policy "Admins read payments" on public.payments
      for select using ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'blocked_slots' and policyname = 'Admins all on blocked_slots') then
    create policy "Admins all on blocked_slots" on public.blocked_slots
      for all using ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true')
      with check ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'settings' and policyname = 'Admins update settings') then
    create policy "Admins update settings" on public.settings
      for update using ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true')
      with check ((auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true');
  end if;
end $$;

-- ── One-time admin flag (run separately, AFTER creating the admin
-- user in Dashboard → Authentication → Users) ───────────────────
-- update auth.users set raw_user_meta_data =
--   raw_user_meta_data || '{"is_admin": true}'::jsonb
--   where email = 'admin@khulnaturf.com';
-- NOTE: raw_user_meta_data is visible in the JWT user_metadata
-- (client-side). Use this only for the admin flag; do not store
-- secrets here.