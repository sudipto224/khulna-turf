# Khulna Turf — Booking & Management System (v5, Vercel-ready)

## v5 changelog (2026-11-06) — user login/register auth

**সমস্যা:** আগে যে কেউ সাইটে ঢুকে বুকিং দিতে পারতো, আর navbar-এর "আমার বুকিং"-এ
সবার বুকিং একসাথে দেখা যেতো। এখন ঠিক করা হয়েছে:
- **গেস্ট (লগইন ছাড়া)** হোম, মাঠসমূহ, ভাড়া, তথ্য, রিভিউ — সব ডেমো হিসেবে দেখতে
  পারবে, লগইন ছাড়াই।
- **বুকিং করতে লগইন লাগবে:** গেস্ট `/booking`-এ গেলে লগইন কার্ড দেখবে
  ("বুক করতে লগইন করুন" + লগইন/রেজিস্টার বাটন); লগইন/রেজিস্টারের পর
  `?next=/booking` দিয়ে বুকিং পেজে ফিরে আসবে। বুকিং ফর্মে নাম+ফোন অ্যাকাউন্ট
  থেকে auto-fill হয়।
- **আমার বুকিং এখন per-user:** প্রত্যেক ইউজার শুধু নিজের বুকিং দেখে —
  `Booking.userId` (ডেমো mode-এ ইউজারের ফোন) দিয়ে ফিল্টার হয়; userId ছাড়া
  পুরনো/seed বুকিং ফোন মিলিয়ে মালিক ঠিক করা হয়। অ্যাডমিন
  (`/admin/bookings`) আগের মতো সব বুকিং দেখে।
- **Auth (`lib/auth.ts`):** ডেমো mode-এ (zero env var) ইউজার localStorage-এ
  (`khulna-turf-users-v1`), সেশন `khulna-turf-session-v1`-এ; পাসওয়ার্ড কখনো
  plain text-এ থাকে না — salt + SHA-256 hash (Web Crypto)। Supabase env vars
  থাকলে একই function signature-এ Supabase Auth ব্যবহার হয় (signUp /
  signInWithPassword / signOut; ফোন → synthetic email
  `<phone>@khulna-turf.local`, নাম user_metadata-এ)।
- **নতুন পেজ:** `/login`, `/register` (প্রিমিয়াম UI, চোখে দেখা যায় এমন এরর,
  `next` param দিয়ে redirect)। হেডারে গেস্ট দেখে "লগইন" + "রেজিস্টার",
  লগইন করা ইউজার দেখে নিজের নাম + "আমার বুকিং" + "লগআউট" (মোবাইল মেনুতেও)।
- **ডেমো অ্যাকাউন্ট (টেস্টের জন্য):** `01700000000` / `demo123`, নাম "Demo User" —
  প্রথম load-এ auto-seed হয়। ⚠️ প্রোডাকশনে যাওয়ার আগে মুছে ফেলুন
  (`lib/auth.ts`-এর `DEMO_USER` + ব্রাউজারের `khulna-turf-users-v1`)।
  অ্যাডমিন ডেমো লগইন (`admin@khulnaturf.com` / `admin123`) আগের মতো আলাদা।
- **পরে যা বাকি:** Supabase Auth-এ ইমেইল কনফার্মেশন সেটআপ, SMS OTP, আর
  অ্যাডমিন auth-কে Supabase Auth-এ নেওয়া — বিস্তারিত `DEPLOY.md`-এ।

## v4 changelog (2026-11-05) — booking fix + new home page

**Booking fix — "slot booking hoyna":**
- Root cause: `confirmPayment()` in `app/booking/page.tsx` returned silently
  when the name was empty or the phone failed the `01XXXXXXXXX` check, and
  step 2 let an invalid phone through to step 3 — so the confirm button
  appeared to do nothing. Fixed: step 2 now validates on click and blocks
  advancing with a visible red error ("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন" /
  "নাম দিন"); step 3 shows the same error and sends the user back to the
  form if needed; the confirm button always ends in the success screen or a
  visible error (try/catch + loading state that always resets). Booked/blocked
  slots are disabled with a clear reason (title/aria-label + "বুকড"/"বন্ধ").
  New bookings still appear in `/my-bookings`. Prices/slot logic unchanged.

**Home page redesign (app/page.tsx only):**
- Full-screen hero with 3 local turf photos (`public/hero/`) rotating every
  4 seconds with a CSS crossfade + dots — no external image URLs, no animation
  library. Minimal text: one short headline, one sub-line, 2 CTAs, one trust
  row; real logo visible in the hero.
- Text cut hard everywhere: compact ground cards (photo top, name, format,
  price, one button), facilities as icon chips only, minimal 2-card pricing,
  short review cards, one compact address/CTA card, one-line offer strip.
- **White gaps fixed:** home no longer uses `Reveal` (opacity-0 by default)
  at all; `components/Reveal.tsx` also gained a 900ms fallback so other
  pages can never stay invisible either.

## v3 changelog (2026-11-05) — Vercel deploy-ready

Customer website + Owner admin dashboard. **Deploy-এর জন্য zero env var লাগে** —
কিছু না বসালেও demo mode-এ চলে (বুকিং localStorage-এ)। Supabase + SSLCommerz
পরে plug-in করার কোড আগে থেকেই দেওয়া আছে — দেখো `DEPLOY.md`।

## v3 changelog (2026-11-05) — Vercel deploy-ready

**Deploy (zero env var):**
- `.nvmrc` → Node 22 পিন করা; `package.json` scripts আগের মতোই webpack
  (`next build --webpack`, Turbopack নয়)। Vercel-এ zero-config deploy হয়।
- কোথাও build-time-এ env var লাগে না — সব env read optional/guarded।

**PWA (ফোনে অ্যাপের মতো ইনস্টল):**
- `public/manifest.webmanifest` + `public/icons/icon-192.png`, `icon-512.png`,
  `apple-touch-icon.png` (আসল লোগো থেকে বানানো)।
- `app/layout.tsx`-এ manifest, themeColor (`#052e16`), appleWebApp সেট করা।

**SEO:**
- `app/layout.tsx`-এ title/description/keywords/Open Graph/Twitter metadata।
- `app/sitemap.ts` (`/sitemap.xml`) আর `app/robots.ts` (`/robots.txt`) — admin
  আর API route বাদ দিয়ে সব পাবলিক পেজ আছে।

**Supabase-ready backend (কোড only, কোনো credential নেই):**
- `@supabase/supabase-js` ইনস্টল করা; `lib/supabase.ts` — client তৈরি হয়
  শুধু `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` থাকলে।
- `supabase/schema.sql` — grounds, bookings, blocked_slots, payments, settings
  টেবিল + RLS policy (public: grounds/settings পড়া, bookings/payments insert;
  বাকি সব service_role দিয়ে)।
- `lib/db.ts` adapter — Supabase থাকলে সেখানে, না থাকলে localStorage-এ।
  বুকিং তৈরি (`app/booking/page.tsx`) এই adapter দিয়ে যায়।

**Payment-ready (কোড only, কোনো credential নেই):**
- `lib/payment.ts` — SSLCommerz init + IPN validate; keys না থাকলে
  `PAYMENT_NOT_CONFIGURED` ফেরত দেয়।
- API routes: `/api/payment/init`, `/success`, `/fail`, `/cancel`, `/ipn`।
  Card দিয়ে বুকিং করলে আগে গেটওয়ে চেষ্টা করে, না থাকলে demo flow চলে।
- `.env.example` — সব var-এর তালিকা, বাংলায় কোনটা কখন লাগবে লেখা আছে।

**ডেপ্লয় গাইড:** `DEPLOY.md` — Dashboard import + CLI দুটো উপায়, আর "পরে যা
add করবা" চেকলিস্ট (Supabase → schema.sql → env vars; SSLCommerz sandbox →
live keys; আসল দাম/ছবি)।

## v2 changelog (2026-11-05) — real client data + premium UI

**Real data from Khulna Turf's Facebook page** (facebook.com/share/1F2CgpiPGV/,
14K followers, category: Playground, collected 2026-11-05):
- Real logo: `public/logo.png` (2048×2048, supplied by the client). Shown in the
  header, footer, admin login/sidebar and as the favicon. The logo has a white
  background (not transparent), so it is always displayed inside a white tile.
  `public/logo-small.png` (512px) is the same artwork resized for web use.
- Real address (40-41, M A Bari Road, Gollamari Sonadanga Link Road, 9100,
  Khulna, Bangladesh), booking hotline 01407-505404, email khulnaturf@gmail.com, "Always open",
  tagline "FOOTBALL • CRICKET • MORE", intro "KEEP CALM AND PLAY CRICKET |
  KEEP CALM AND PLAY FOOTBALL". No website or separate WhatsApp number is listed.
- **Slots are now 90-minute blocks, 16/day, 12:00 AM–11:59 PM** (was 1-hour slots,
  7 AM–11 PM in v1). Booking grid, pricing table, admin calendar/reports/slots
  and seed bookings all use the 90-minute slots; seed totals were recomputed
  with the demo per-slot prices.
- November offer banner (home + booking + pricing): flat ৳600 off, 1:30 AM–
  4:30 PM slots, 1–30 Nov 2026.
- Real Facebook reviews on the home page (zareefj.22, Mahin Chowdhury,
  Mir Zessan). Facebook reviews have no star ratings — the 5 stars shown are
  illustrative only.
- Facilities from Facebook: floodlit astroturf (football + cricket), cafeteria,
  gallery, changing rooms, washroom, gaming zone, swimming pool package
  (advertised on the cover only — no pool photos exist yet).

**Premium UI (same stack, no new dependencies):**
- Design system from the logo's palette — deep black-green, turf green, white,
  restrained gold accent — in `app/globals.css` (`@theme` tokens + shared
  `.btn-primary` / `.btn-dark` / `.card` / `.eyebrow` / `.section-title`).
- New hero with the real logo, trust signals (14K followers, real reviews,
  Always Open, hotline) and the offer as a premium dark+gold banner.
- Consistent buttons, cards, section headings, hover/focus states and footer
  (real address / phone / email) on every page; admin dashboard keeps the same
  system (accent stat cards, status pills, clean tables/reports).

**Still placeholder — confirm with the client before calling this final:**
- **Prices:** regular slot prices are NOT published on Facebook. ৳800 off-peak /
  ৳1200 peak are DEMO prices, now charged per 90-minute slot, and are clearly
  marked "ডেমো দাম" in the UI and in `lib/data.ts` (PRICING TODO).
- **Ground sizes** (Ground A 40m×25m, Ground B 30m×18m) are demo placeholders —
  not published on Facebook.
- **Photos:** grounds still use CSS gradients; no real ground photos yet.
- **Payment:** demo only, no real money moves. **Backend:** localStorage only.

## Run (Windows-safe: webpack, NOT Turbopack)

```bash
npm install
npm run dev      # → http://localhost:3000  (next dev --webpack)
npm run build    # production build (next build --webpack)
npm start        # production server
```

> Turbopack is intentionally NOT used — it failed on win32/x64 before
> (portfolio v1/v2). All scripts use `--webpack` by default.

## Demo login (Owner admin)

- URL: `/admin`
- Email: `admin@khulnaturf.com`
- Password: `admin123`

## Pages

| Route | What it is |
|---|---|
| `/` | Home — hero with logo, November offer, today's 90-min slots, grounds, facilities, pricing, real reviews, address |
| `/grounds` | Both grounds |
| `/grounds/[id]` | Ground A (7-a-side) / Ground B (5-a-side) detail |
| `/booking` | Date + ground + 90-min slots (16/day, 12 AM–11:59 PM), form, advance payment (demo), success + QR box + Booking ID |
| `/my-bookings` | Bookings from localStorage, cancel |
| `/pricing` | Full 90-min slot price table (demo prices, clearly marked) |
| `/info` | Address, rules, cancellation / refund policy |
| `/admin` | Dashboard — today's bookings, revenue, advance, due, occupancy |
| `/admin/bookings` | All bookings, filter, Confirm / Mark Paid / Cancel |
| `/admin/calendar` | 7-day week view per ground |
| `/admin/slots` | Block / unblock slots (maintenance) |
| `/admin/customers` | Regular teams, total spent |
| `/admin/reports` | Revenue by day, occupancy by hour, per-ground |
| `/admin/settings` | Edit turf name, address, phone, prices (saved to localStorage) |

## Where to edit for the real client — ONLY these files first

1. **`lib/data.ts`** — EVERYTHING client-specific lives here:
   `TURF` (name, exact address, Google Maps link, phone, WhatsApp),
   `GROUNDS`, `PRICING` (peak ৳1200 / off-peak ৳800 per 90-min slot, advance 50% or ৳500),
   `SEED_BOOKINGS`, `REVIEWS`, `FACILITIES`, `SLOT_STARTS`.
2. **`lib/store.ts`** — localStorage helpers. This is the one file to
   swap for Supabase / Laravel API calls in production.
3. **`components/`** — Header, Footer, SlotGrid, OfferBanner, AdminGuard.
4. **`app/globals.css`** — the premium design system (colours, buttons, cards).

## Pricing (demo, editable in lib/data.ts)

- Off-peak (slots starting 12 AM–4 PM, 10 PM–11:59 PM): ৳800 / 90-min slot
- Peak (slots starting 4 PM–10 PM): ৳1200 / 90-min slot
- Advance: 50% OR fixed ৳500 — user chooses at checkout
- November offer: flat ৳600 off, 1:30 AM–4:30 PM slots, 1–30 Nov 2026

## Production TODOs (clearly marked in code)

- Real prices: confirm per-slot prices with the owner (`lib/data.ts` PRICING).
- Real photos: replace CSS gradients in grounds with uploaded photos
  (`public/grounds/` — `next.config.ts`-এ Supabase Storage remote pattern দেওয়া আছে)।
- Real payment: **কোড রেডি (v3)** — `lib/payment.ts` + `/api/payment/*`।
  শুধু SSLCommerz keys বাকি (Vercel env vars, দেখো `DEPLOY.md` §2)।
- Real backend: **কোড রেডি (v3)** — `supabase/schema.sql` + `lib/db.ts`।
  শুধু Supabase প্রজেক্ট + ২টা env var বাকি (দেখো `DEPLOY.md` §1)।
- SMS / WhatsApp confirmation on booking (currently a note on the success page).
- Real auth: replace demo localStorage login in `components/AdminGuard.tsx`
  with Supabase Auth (admin পেজ এখনও localStorage login-এ চলে)।

## Tech

Next.js 16 (App Router) • React 19 • TypeScript • Tailwind CSS 4 •
CSS keyframes + IntersectionObserver only — **no framer-motion, no Three.js**.
