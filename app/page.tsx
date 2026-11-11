import Link from "next/link";
import Image from "next/image";
import HeroRotator from "../components/HeroRotator";
import ReviewsSection from "../components/ReviewsSection";
import { FACILITIES, GROUNDS, NOVEMBER_OFFER, TURF, fmt } from "../lib/data";
import { getSettings } from "../lib/db";

// Home v4 — premium, minimal, visual-first. Text cut hard; no Reveal
// (sections are visible by default — the old opacity-0 reveal left white gaps).
// Hero photos rotate every 4s (see components/HeroRotator.tsx).
const GROUND_IMAGES: Record<string, { src: string; w: number; h: number }> = {
  "ground-a": { src: "/hero/hero-football-night.jpg", w: 2240, h: 1120 },
};

export default async function Home() {
  const settings = await getSettings();
  return (
    <main>
      {/* Full-screen rotating hero */}
      <HeroRotator>
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-3 rounded-2xl bg-white p-2 pr-4 shadow-xl">
            <Image
              src="/logo-small.png"
              alt="Khulna Turf — official logo"
              width={512}
              height={512}
              sizes="48px"
              className="h-12 w-12 object-contain"
            />
            <span>
              <span className="block text-lg font-extrabold leading-none text-green-950">Khulna Turf</span>
              <span className="block text-[10px] font-bold tracking-[0.18em] text-green-700">FOOTBALL • CRICKET • MORE</span>
            </span>
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight drop-shadow md:text-7xl">
            খেলুন আজই —<br />
            <span className="text-lime-400">খুলনার সেরা টার্ফে</span>
          </h1>
          <p className="mt-4 text-lg text-green-100 drop-shadow">৯০ মিনিটের স্লট • অনলাইন বুকিং</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/booking" className="btn-primary">⚽ এখনই বুক করুন</Link>
            <Link href="/grounds" className="btn-ghost">মাঠটি দেখুন</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/30 backdrop-blur-md border border-white/25 px-4 py-2 text-sm font-semibold text-white shadow flex items-center gap-2">
              <span className="text-lime-400">🕖</span> Always Open
            </span>
            <a
              href={`tel:${TURF.phone}`}
              className="rounded-full bg-black/30 backdrop-blur-md border border-white/25 px-4 py-2 text-sm font-semibold text-white shadow flex items-center gap-2 hover:bg-black/40 transition"
            >
              <span className="text-lime-400">📞</span> {TURF.phone}
            </a>
          </div>
        </div>
      </HeroRotator>

      {/* Offer — one line */}
      <Link href="/booking" className="offer-strip offer-strip-lift block px-4 py-3 text-center text-sm font-bold text-white">
        <span className="offer-wiggle">🎉</span> নভেম্বর অফার: ফ্ল্যাট <span className="offer-bounce offer-glow text-lime-300">৳{NOVEMBER_OFFER.discount} ছাড়</span> • {NOVEMBER_OFFER.window} • {NOVEMBER_OFFER.dates} — বুক করুন <span className="offer-arrow-nudge">→</span>
      </Link>

      {/* Grounds — compact cards */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="section-title">মাঠসমূহ</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {GROUNDS.map((g) => {
            const gi = GROUND_IMAGES[g.id] ?? GROUND_IMAGES["ground-a"];
            return (
              <article key={g.id} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(5,46,22,.35)]">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={gi.src}
                    alt={`${g.name} — ${g.format}`}
                    width={gi.w}
                    height={gi.h}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="text-2xl font-extrabold drop-shadow">{g.name} — {g.format}</h3>
                  <p className="text-sm opacity-90">{g.size} • {g.surface}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <p><span className="text-xl font-extrabold text-green-800">{fmt(settings.offPeak)}/স্লট</span> <span className="text-xs text-slate-400">(৯০ মিনিট)</span></p>
                <Link href={`/grounds/${g.id}`} className="btn-dark !px-4 !py-2.5 text-sm">বুক করুন →</Link>
              </div>
            </article>
          );})}
        </div>
      </section>

      {/* Facilities — icon chips only */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="section-title">সুবিধা</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {FACILITIES.map((f) => (
            <span key={f.title} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-900 shadow-sm ring-1 ring-slate-100">{f.icon} {f.title}</span>
          ))}
        </div>
      </section>

      {/* Pricing — minimal */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="section-title">ভাড়া</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-500">অফ-পিক</p>
            <p className="mt-1 text-4xl font-extrabold text-green-800">{fmt(settings.offPeak)}<span className="text-base font-normal text-slate-500"> / স্লট</span></p>
          </div>
          <div className="card p-5 !border-orange-200 bg-orange-50/60">
            <p className="text-sm font-bold text-orange-700">পিক • বিকেল ৪টা – রাত ১০টা</p>
            <p className="mt-1 text-4xl font-extrabold text-orange-700">{fmt(settings.peak)}<span className="text-base font-normal text-slate-500"> / স্লট</span></p>
          </div>
        </div>
      </section>

      {/* Reviews — real customer reviews (localStorage), no fake/seeded reviews */}
      <section className="bg-[#04150b] py-10 text-white">
        <ReviewsSection />
      </section>

      {/* Address / CTA — compact, one card */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="card flex flex-wrap items-center justify-between gap-5 p-6">
          <div>
            <h2 className="text-2xl font-extrabold text-green-950">📍 গল্লামারী, খুলনা</h2>
            <p className="mt-1 text-sm text-slate-600">{TURF.address}</p>
            <p className="mt-1 text-sm text-slate-600">📞 {TURF.phone} • ✉️ {TURF.email} • 🕖 {TURF.openingHours}</p>
          </div>
          <Link href="/booking" className="btn-dark">এখনই বুক করুন →</Link>
        </div>
      </section>
    </main>
  );
}
