"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GROUNDS, fmt } from "../../lib/data";

const SLIDES = [
  { src: "/hero/hero-football-night.jpg", alt: "ফ্লাডলাইটে রাতের ফুটবল — খুলনা টার্ফ", w: 2240, h: 1120 },
  { src: "/hero/hero-cricket.jpg", alt: "সন্ধ্যায় ক্রিকেট ব্যাটসম্যান — খুলনা টার্ফ", w: 1920, h: 1280 },
  { src: "/hero/hero-football-day.jpg", alt: "দিনের বেলায় ফুটবল অ্যাকশন — খুলনা টার্ফ", w: 1920, h: 1280 },
];

export default function GroundsPage() {
  const g = GROUNDS[0];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-green-950">আমাদের মাঠ</h1>
      <p className="mt-1 text-slate-600">খুলনার সেরা প্রিমিয়াম অ্যাস্ট্রোটার্ফ মাঠ — ক্রিকেট ও ফুটবলের জন্য।</p>

      <div className="mt-10 mx-auto max-w-3xl rounded-[2rem] bg-white shadow-xl transition hover:-translate-y-1 duration-200 overflow-hidden border border-slate-100">
        {/* Hero area — living photo hero */}
        <div className="relative h-64 md:h-72 overflow-hidden">
          {SLIDES.map((s, i) => (
            <Image
              key={s.src}
              src={s.src}
              alt={i === active ? s.alt : ""}
              aria-hidden={i !== active}
              width={s.w}
              height={s.h}
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={i === 0}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === active ? "opacity-100 hero-zoom" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04150b]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(600px_500px_at_50%_-20%,rgba(201,162,39,0.15),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#04150b]/60 to-transparent pointer-events-none" />
          <div className="relative z-10 p-6 md:p-8 flex flex-col items-start justify-between h-full">
            <div className="flex gap-2">
              <span className="badge-float rounded-full bg-white/15 backdrop-blur border-white/30 px-3 py-1 text-sm font-semibold text-white">🏏 ক্রিকেট</span>
              <span className="badge-float rounded-full bg-white/15 backdrop-blur border-white/30 px-3 py-1 text-sm font-semibold text-white">⚽ ফুটবল</span>
            </div>
            <div className="mt-4 sm:mt-0">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Ground</h2>
              <p className="text-lg text-white/90 mt-1">7-a-side • 40m × 25m</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-slate-600">{g.description}</p>

          <ul className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <li><span className="font-semibold text-green-900">সাইজ:</span> {g.size}</li>
            <li><span className="font-semibold text-green-900">সারফেস:</span> {g.surface}</li>
            <li><span className="font-semibold text-green-900">ধারণক্ষমতা:</span> {g.capacity}</li>
            <li><span className="font-semibold text-green-900">ফ্লাডলাইট:</span> {g.floodlight ? "আছে" : "নেই"}</li>
          </ul>

          <div className="flex flex-wrap gap-2">
            {g.facilities.map((f) => (
              <span key={f} className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-800">{f}</span>
            ))}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-2xl font-extrabold text-green-800">{fmt(800)} – {fmt(1200)} <span className="text-sm font-normal text-slate-500">/ ৯০ মিনিটের স্লট</span></p>
            <Link href={`/grounds/${g.id}`} className="rounded-xl bg-[#052e16] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#bef264] hover:text-[#052e16] transition">বিস্তারিত ও বুকিং →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
