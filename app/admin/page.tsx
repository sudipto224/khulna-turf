"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { dateStr, fmt, groundById, prettyDate, slotLabel, type Booking } from "../../lib/data";
import { loadBookingsAsync } from "../../lib/db";

export default function AdminDashboard() {
  const [list, setList] = useState<Booking[]>([]);
  useEffect(() => {
    let alive = true;
    loadBookingsAsync().then((list) => { if (alive) setList(list); });
    return () => { alive = false; };
  }, []);
  const today = dateStr(new Date());
  const todays = useMemo(() => list.filter((b) => b.date === today && b.status !== "cancelled"), [list, today]);
  const revenue = todays.reduce((s, b) => s + b.total, 0);
  const advance = todays.reduce((s, b) => s + b.advance, 0);
  const due = todays.reduce((s, b) => s + b.due, 0);
  const occupancy = Math.round((todays.reduce((s, b) => s + b.hours.length, 0) / (2 * 16)) * 100);
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-green-950">ড্যাশবোর্ড — আজ, {prettyDate(today)}</h1>
      <p className="text-sm text-slate-500">খুলনা টার্ফের আজকের ব্যবসা এক নজরে</p>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "আজকের বুকিং", value: String(todays.length), sub: `${list.filter((b) => b.status !== "cancelled").length}টি মোট বুকিং` },
          { label: "আজকের আয় (মোট)", value: fmt(revenue), sub: "সব স্লটের মোট ভাড়া" },
          { label: "অ্যাডভান্স পেয়েছেন", value: fmt(advance), sub: "অনলাইনে জমা" },
          { label: "বাকি (Due)", value: fmt(due), sub: "মাঠে নিতে হবে", warn: true },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border-l-4 border-lime-400 bg-white p-5 shadow-[0_10px_28px_-14px_rgba(5,46,22,.3)] ring-1 ring-slate-100"><p className="text-sm text-slate-500">{c.label}</p><p className={`mt-1 text-2xl font-extrabold ${c.warn ? "text-orange-600" : "text-green-800"}`}>{c.value}</p><p className="text-xs text-slate-400">{c.sub}</p></div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
          <h2 className="font-bold">আজকের স্লটসমূহ</h2>
          {todays.length === 0 && <p className="mt-3 text-sm text-slate-500">আজ এখনো কোনো বুকিং নেই।</p>}
          <div className="mt-3 space-y-2">
            {todays.sort((a, b) => a.hours[0] - b.hours[0]).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span><b>{b.hours.map(slotLabel).join(", ")}</b> • {groundById(b.groundId).name} • {b.team} ({b.name}, {b.phone})</span>
                <span className="font-bold text-green-800">{fmt(b.total)} <span className="font-normal text-slate-500">• বাকি {fmt(b.due)}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="font-bold">অকুপেন্সি</h2>
          <p className="mt-3 text-5xl font-extrabold text-green-800">{occupancy}%</p>
          <p className="text-sm text-slate-500">আজকের মোট স্লটের মধ্যে বুকড</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-lime-500" style={{ width: `${occupancy}%` }} /></div>
          <div className="mt-5 space-y-2">
            <Link href="/admin/bookings" className="block rounded-lg bg-green-900 py-2.5 text-center text-sm font-bold text-white">সব বুকিং দেখুন →</Link>
            <Link href="/admin/calendar" className="block rounded-lg bg-slate-100 py-2.5 text-center text-sm font-bold">ক্যালেন্ডার দেখুন</Link>
            <Link href="/admin/reports" className="block rounded-lg bg-slate-100 py-2.5 text-center text-sm font-bold">রিপোর্ট দেখুন</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
