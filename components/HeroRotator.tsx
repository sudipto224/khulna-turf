"use client";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

// Full-screen hero with 3 local turf photos rotating every 4 seconds.
// CSS opacity crossfade + a small interval — no animation library.
// Images are local files in public/hero/ (no external URLs).
const SLIDES = [
  { src: "/hero/hero-football-night.jpg", alt: "ফ্লাডলাইটে রাতের ফুটবল — খুলনা টার্ফ", w: 2240, h: 1120 },
  { src: "/hero/hero-cricket.jpg", alt: "সন্ধ্যায় ক্রিকেট ব্যাটসম্যান — খুলনা টার্ফ", w: 1920, h: 1280 },
  { src: "/hero/hero-football-day.jpg", alt: "দিনের বেলায় ফুটবল অ্যাকশন — খুলনা টার্ফ", w: 1920, h: 1280 },
];

export default function HeroRotator({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#04150b] text-white">
      {/* Rotating photos — crossfade. First slide loads immediately (priority); rest lazy after mount. */}
      {SLIDES.map((s, i) => (
        <Image
          key={s.src}
          src={s.src}
          alt={i === active ? s.alt : ""}
          aria-hidden={i !== active}
          width={s.w}
          height={s.h}
          sizes="100vw"
          priority={i === 0}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === active ? "opacity-100 hero-zoom" : "opacity-0"}`}
        />
      ))}
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#04150b]/90 via-[#04150b]/55 to-[#04150b]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04150b]/80 via-transparent to-[#04150b]/30" />
      {/* Bottom scrim behind trust chips for readability over busy hero photos */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#04150b]/60 to-transparent pointer-events-none" />
      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20">{children}</div>
      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`ছবি ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${i === active ? "w-8 bg-lime-400" : "w-2 bg-white/50 hover:bg-white"}`}
          />
        ))}
      </div>
    </section>
  );
}
