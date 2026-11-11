"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NOVEMBER_OFFER, TURF } from "../lib/data";
import { logout, useAuthUser } from "../lib/auth";

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/grounds", label: "মাঠসমূহ" },
  { href: "/booking", label: "বুক করুন" },
  { href: "/pricing", label: "ভাড়া" },
  { href: "/my-bookings", label: "আমার বুকিং" },
  { href: "/info", label: "তথ্য ও নিয়ম" },
];

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // v5: guest → লগইন/রেজিস্টার; logged-in → নাম + আমার বুকিং + লগআউট
  const { user } = useAuthUser();
  const firstName = user ? user.name.split(" ")[0] : "";
  const doLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/");
  };
  if (path.startsWith("/admin")) return null;
  return (
    <header className="sticky top-0 z-50 shadow-[0_8px_30px_-12px_rgba(4,21,11,.6)]">
      <div className="bg-[#052e16] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            {/* Logo has a white background, so it sits inside a white tile */}
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow">
              <Image src="/logo-small.png" alt="Khulna Turf logo" width={512} height={512} sizes="44px" className="h-full w-full object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight">Khulna Turf</span>
              <span className="block text-[10px] font-semibold tracking-[0.18em] text-lime-300">FOOTBALL • CRICKET • MORE</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${path === l.href ? "bg-lime-400 font-bold text-green-950" : "hover:bg-green-800"}`}>{l.label}</Link>
            ))}
            {user ? (
              <>
                <span className="ml-2 rounded-lg bg-green-800 px-3 py-2 text-sm font-bold text-lime-300">👤 {firstName}</span>
                <button onClick={() => void doLogout()} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-800">লগআউট</button>
              </>
            ) : (
              <>
                <Link href="/login" className="ml-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-800">লগইন</Link>
                <Link href="/register" className="rounded-lg bg-lime-400 px-3 py-2 text-sm font-bold text-green-950">রেজিস্টার</Link>
              </>
            )}
            <Link href="/booking" className="btn-primary ml-2 !px-4 !py-2.5 text-sm">এখনই বুক করুন</Link>
          </nav>
          <button onClick={() => setOpen(!open)} className="rounded-lg bg-green-800 px-3 py-2 text-lg md:hidden" aria-label="Menu">☰</button>
        </div>
        {open && (
          <nav className="border-t border-green-800 px-4 pb-4 md:hidden">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-green-800">{l.label}</Link>
            ))}
            <Link href="/booking" className="mt-1 block rounded-lg bg-lime-400 px-3 py-2.5 text-sm font-bold text-green-950">এখনই বুক করুন →</Link>
            {user ? (
              <>
                <p className="block rounded-lg px-3 py-2.5 text-sm font-bold text-lime-300">👤 {user.name} ({user.phone})</p>
                <button onClick={() => void doLogout()} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-green-800">লগআউট</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-green-800">লগইন</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-bold text-lime-300">রেজিস্টার →</Link>
              </>
            )}
            <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-sm text-lime-300">মালিক লগইন →</Link>
          </nav>
        )}
      </div>
      <div className="offer-strip px-4 py-1.5 text-center text-xs font-semibold text-white">
        <span className="offer-wiggle">🎉</span> নভেম্বর অফার: ফ্ল্যাট <span className="offer-bounce offer-glow text-lime-300 font-bold">৳{NOVEMBER_OFFER.discount} ছাড়</span> — {NOVEMBER_OFFER.window} স্লটে ({NOVEMBER_OFFER.dates}) • হটলাইন {TURF.phone}
      </div>
    </header>
  );
}
