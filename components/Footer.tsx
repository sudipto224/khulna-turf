"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { TURF } from "../lib/data";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#04150b] text-green-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow">
              <Image src="/logo-small.png" alt="Khulna Turf logo" width={512} height={512} sizes="56px" className="h-full w-full object-contain" />
            </span>
            <span>
              <span className="block text-xl font-extrabold text-white">Khulna Turf</span>
              <span className="block text-[10px] font-semibold tracking-[0.18em] text-lime-300">FOOTBALL • CRICKET • MORE</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-green-200">{TURF.intro}</p>
          <p className="mt-3 text-sm">📍 {TURF.address}</p>
          <p className="mt-1 text-sm">📞 বুকিং হটলাইন: {TURF.phone}</p>
          <p className="mt-1 text-sm">✉️ {TURF.email}</p>
          <p className="mt-1 text-sm">🕖 {TURF.openingHours}</p>
        </div>
        <div>
          <p className="font-bold text-white">দ্রুত লিংক</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="transition hover:text-lime-300" href="/booking">স্লট বুক করুন</Link></li>
            <li><Link className="transition hover:text-lime-300" href="/grounds">মাঠসমূহ</Link></li>
            <li><Link className="transition hover:text-lime-300" href="/pricing">ভাড়ার তালিকা</Link></li>
            <li><Link className="transition hover:text-lime-300" href="/my-bookings">আমার বুকিং</Link></li>
            <li><Link className="transition hover:text-lime-300" href="/info">নিয়ম ও ক্যানসেল পলিসি</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white">যোগাযোগ</p>
          <a href={TURF.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-green-950 transition hover:bg-lime-300">📍 গুগল ম্যাপে দেখুন</a>
          <a href={`https://wa.me/${TURF.whatsapp}`} target="_blank" rel="noreferrer" className="ml-2 mt-3 inline-block rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-green-950 transition hover:bg-slate-100">💬 হোয়াটসঅ্যাপ</a>
          <div className="mt-4 flex gap-2">
            <a href={TURF.facebook} target="_blank" rel="noreferrer" aria-label="Khulna Turf Facebook page" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#052e16] border border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-[#052e16] transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.658 9.107 8.438 9.876v-6.987h-2.54V12h2.54V9.797c0-2.506 1.482-3.79 3.773-3.79 1.094 0 2.238.196 2.238.196v2.46h-1.259c-1.263 0-1.63.771-1.63 1.565V12h2.773l-0.423 2.877h-2.35v6.987C18.342 21.107 22 16.991 22 12z"/></svg>
            </a>
            <a href={`mailto:${TURF.email}`} aria-label="Email Khulna Turf" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#052e16] border border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-[#052e16] transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-green-300">© 2026 Khulna Turf — সর্বস্বত্ব সংরক্ষিত</div>
    </footer>
  );
}
