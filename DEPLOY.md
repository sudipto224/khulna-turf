# Khulna Turf — Vercel-এ Deploy করার গাইড (v5)

এই সাইট **এখনই Vercel-এ deploy করা যাবে, কোনো env var ছাড়াই** — demo mode-এ চলবে
(ইউজার অ্যাকাউন্ট + বুকিং ওই ব্রাউজারের localStorage-এ সেভ হবে, পেমেন্ট demo)।
পেমেন্ট আর Supabase পরে যোগ করবে।

## v5 — ইউজার লগইন/রেজিস্টার (নতুন)

- গেস্ট (লগইন ছাড়া) হোম, মাঠ, ভাড়া, তথ্য, রিভিউ — সব দেখতে পারবে, ডেমো হিসেবে।
- বুকিং করতে লগইন লাগবে: গেস্ট `/booking`-এ গেলে লগইন কার্ড দেখবে, লগইন করলে
  আবার বুকিং পেজে ফিরে আসবে। বুকিং ফর্মে নাম+ফোন অ্যাকাউন্ট থেকে বসে যায়।
- **আমার বুকিং:** প্রত্যেক ইউজার শুধু নিজের বুকিং দেখে — অন্যেরটা কখনো নয়।
  (অ্যাডমিন `/admin/bookings`-এ সব বুকিং দেখে, আগের মতো।)
- ডেমো অ্যাকাউন্ট (টেস্টের জন্য): মোবাইল `01700000000` / পাসওয়ার্ড `demo123`।
  ⚠️ **প্রোডাকশনে যাওয়ার আগে এই ডেমো অ্যাকাউন্ট মুছে ফেলুন** — ডেমো অ্যাকাউন্টের
  ইউজাররা `lib/auth.ts`-এ `DEMO_USER` হিসেবে আছে, আর ব্রাউজারের localStorage-এ
  `khulna-turf-users-v1` key-টাও মুছে ফেলুন (Application → Local Storage)।
- পাসওয়ার্ড কখনো plain text-এ থাকে না — salt + SHA-256 hash-এ সেভ হয়
  (`lib/auth.ts`); Supabase চালু হলে Supabase Auth ব্যবহার হয়।

## Option A — Vercel Dashboard (সবচেয়ে সহজ, কোড ছাড়াই)

1. প্রজেক্টটা GitHub-এ push করো:
   ```bash
   cd khulna-turf
   git init
   git add .
   git commit -m "Khulna Turf v3"
   git branch -M main
   git remote add origin https://github.com/<tomar-username>/khulna-turf.git
   git push -u origin main
   ```
   > GitHub-এ নতুন repo বানিয়ে নেবে (Private রাখলেও চলবে)।
2. [vercel.com](https://vercel.com) → **Add New → Project** → GitHub repo `khulna-turf` Import করো।
3. **Framework Preset: Next.js** (নিজে থেকেই ধরবে)। Build Command: `next build --webpack`
   (package.json-এ আগেই দেওয়া আছে, বদলাতে হবে না)।
4. **Environment Variables: এখন কিছুই বসাবে না** — খালি রেখে **Deploy** চাপো।
5. ২–৩ মিনিট পর তোমার সাইট live: `https://khulna-turf.vercel.app` (বা Vercel যা নাম দেয়)।

## Option B — Vercel CLI (টার্মিনাল থেকে)

```bash
cd khulna-turf
npm install
npx vercel login        # ব্রাউজারে Vercel অ্যাকাউন্টে লগইন করবে (তুমি নিজে করবে)
npx vercel              # প্রথমবার: সেটআপ প্রশ্নে Enter চেপে যাও
npx vercel --prod       # production deploy
```

> Vercel লগইন তোমার নিজের অ্যাকাউন্ট দিয়ে তোমার ল্যাপটপেই করতে হবে —
> আমি তোমার Vercel অ্যাকাউন্টে ঢুকতে পারবো না।

## Deploy-এর পর চেকলিস্ট

- [ ] হোম পেজ খুলছে, লোগো দেখা যাচ্ছে
- [ ] `/booking` থেকে একটা টেস্ট বুকিং করো — আগে লগইন চাইবে; ডেমো অ্যাকাউন্ট
  (`01700000000` / `demo123`) দিয়ে লগইন করে বুকিং করো, তারপর `/my-bookings`-এ
  শুধু নিজের বুকিং দেখাচ্ছে কিনা দেখো
- [ ] `/login` আর `/register` খুলছে কিনা দেখো
- [ ] `/admin` খুলে দেখো (demo login: `admin@khulnaturf.com` / `admin123`)
- [ ] ফোনে সাইট খুলে "Add to Home Screen" / Install দেখাচ্ছে কিনা (PWA)
- [ ] `/sitemap.xml` আর `/robots.txt` খুলছে কিনা

## পরে যা add করবা (একটার পর একটা)

### 1. Supabase (আসল ডাটাবেস + আসল লগইন) — যখন বুকিং সবার কাছে এক জায়গায় চাইবে
1. [supabase.com](https://supabase.com) → ফ্রি প্রজেক্ট বানাও।
2. Dashboard → **SQL Editor** → `supabase/schema.sql` ফাইলের পুরোটা paste করে **Run**।
   (v3-তে আগেই schema চালিয়ে থাকলে শুধু `user_id` কলাম যোগের লাইনটা চালাও —
   schema.sql-এর ভেতরেই দেওয়া আছে।)
3. **Settings → API** থেকে `Project URL` আর `anon public key` নাও।
4. Vercel Dashboard → প্রজেক্ট → **Settings → Environment Variables**-এ বসাও:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deployments → Redeploy** করো। এরপর থেকে বুকিং Supabase-এ সেভ হবে **আর
   লগইন/রেজিস্টার Supabase Auth দিয়ে চলবে** (ফোন নম্বর দিয়ে, `lib/auth.ts`
   দেখো)। লগইনের জন্য: Supabase Dashboard → **Authentication → Providers →
   Email → "Confirm email" বন্ধ রাখো** — না হলে রেজিস্টারের পর লগইন আটকে যাবে।
   পরে SMS OTP চাইলে Twilio / SSLCommerz SMS যোগ করা যাবে।

### 2. SSLCommerz (আসল পেমেন্ট) — bKash / Nagad / Card
1. [sslcommerz.com](https://sslcommerz.com) থেকে **sandbox** store খুলে টেস্ট করো।
2. Vercel env vars-এ বসাও:
   - `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`
   - `SSLCOMMERZ_SANDBOX=true` (টেস্টে), live-এ গেলে `false`
3. Redeploy করো। তারপর Card দিয়ে বুকিং করলে আসল SSLCommerz গেটওয়ে খুলবে।
4. Live-এ যাওয়ার আগে sandbox-এ পুরো ফ্লো টেস্ট করো, তারপর live keys বসাও।
   > টাকা ক্লায়েন্টের মার্চেন্ট অ্যাকাউন্টে যাবে — keys শুধু ওনারই দিতে পারবে।

### 3. আসল তথ্য (ক্লায়েন্টের কাছ থেকে)
- আসল স্লটের দাম → `lib/data.ts` → `PRICING` (এখন ৳৮০০/৳১২০০ ডেমো দাম)
- মাঠের আসল মাপ → `lib/data.ts` → `GROUNDS`
- মাঠের আসল ছবি → `public/grounds/` ফোল্ডারে রেখে `GROUNDS`-এর gradient-এর জায়গায় ছবি বসাও
- আসল ডোমেইন থাকলে Vercel → Settings → Domains-এ যোগ করো, আর
  `NEXT_PUBLIC_SITE_URL` env var-এ আসল ঠিকানাটা বসাও (SEO/sitemap-এর জন্য)

### 4. (ঐচ্ছিক) PWA আইকন
`public/icons/`-এ লোগো থেকে বানানো 192/512 আইকন দেওয়া আছে — বদলাতে চাইলে
নতুন লোগো দিয়ে একই নামে ফাইল বদলে দিলেই হবে।

## সমস্যা হলে

| সমস্যা | সমাধান |
|---|---|
| Build fail হচ্ছে | Vercel deploy log-এ প্রথম error লাইনটা দেখো; বেশিরভাগ সময় Node version — `.nvmrc`-এ Node 22 পিন করা আছে |
| লগইনে "মোবাইল নম্বর বা পাসওয়ার্ড ভুল" | ডেমো অ্যাকাউন্ট `01700000000` / `demo123` দিয়ে চেষ্টা করো; নতুন অ্যাকাউন্ট `/register`-এ খুলে নাও |
| সাইট খুলছে কিন্তু বুকিং সেভ হচ্ছে না | Env vars ছাড়া demo mode-এ বুকিং শুধু ওই ব্রাউজারে থাকে — এটা স্বাভাবিক; Supabase চালু করলে সবার বুকিং এক জায়গায় যাবে |
| পেমেন্টে "PAYMENT_NOT_CONFIGURED" | স্বাভাবিক — SSLCommerz keys এখনও বসানো হয়নি, demo payment চলছে |
