"use client";
import { useEffect, useMemo, useState } from "react";
import { fmt, GROUNDS, groundById, slotHours, slotLabel, type Booking } from "../../../lib/data";
import { loadBookingsAsync } from "../../../lib/db";

export default function AdminReports() {
  const [list, setList] = useState<Booking[]>([]);
  useEffect(() => {
    let alive = true;
    loadBookingsAsync().then((list) => { if (alive) setList(list); });
    return () => { alive = false; };
  }, []);
  const active = useMemo(() => list.filter((b) => b.status !== "cancelled"), [list]);
  const totalRevenue = active.reduce((s, b) => s + b.total, 0);
  const totalAdvance = active.reduce((s, b) => s + b.advance, 0);
  const byDate = useMemo(() => {
    const m = new Map<string, number>();
    active.forEach((b) => m.set(b.date, (m.get(b.date) || 0) + b.total));
    return [...m.entries()].sort();
  }, [active]);
  const maxDay = Math.max(1, ...byDate.map(([, v]) => v));
  const byHour = slotHours().map((h) => ({ hour: h, count: active.reduce((s, b) => s + (b.hours.includes(h) ? 1 : 0), 0) }));
  const maxHour = Math.max(1, ...byHour.map((x) => x.count));
  const byGround = GROUNDS.map((g) => ({ id: g.id, total: active.filter((b) => b.groundId === g.id).reduce((s, b) => s + b.total, 0), count: active.filter((b) => b.groundId === g.id).length }));
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-green-950">রিপোর্ট ও অ্যানালিটিক্স</h1>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-slate-500">মোট আয় (সব বুকিং)</p><p className="text-3xl font-extrabold text-green-800">{fmt(totalRevenue)}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-slate-500">মোট অ্যাডভান্স</p><p className="text-3xl font-extrabold text-green-800">{fmt(totalAdvance)}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-slate-500">মোট বুকিং</p><p className="text-3xl font-extrabold text-green-800">{active.length}টি</p></div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="font-bold">দিন অনুযায়ী আয়</h2>
          <div className="mt-4 space-y-3">
            {byDate.map(([d, v]) => (
              <div key={d}><div className="flex justify-between text-sm"><span>{d}</span><b>{fmt(v)}</b></div><div className="mt-1 h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-lime-500" style={{ width: `${(v / maxDay) * 100}%` }} /></div></div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="font-bold">কোন সময় সবচেয়ে বেশি বুক হয়</h2>
          <div className="mt-4 flex h-32 items-end gap-1">
            {byHour.map((x) => (
              <div key={x.hour} title={`${slotLabel(x.hour)} — ${x.count}টি`} className="flex-1 rounded-t bg-green-700" style={{ height: `${Math.max(4, (x.count / maxHour) * 100)}%` }} />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">বাম থেকে ডান: রাত ১২টা → রাত ১১:৫৯ (৯০ মিনিটের স্লট)। সবচেয়ে উঁচু বার = সবচেয়ে ব্যস্ত সময় (সাধারণত সন্ধ্যা)।</p>
          <h3 className="mt-5 font-bold">মাঠ অনুযায়ী</h3>
          {byGround.map((g) => <p key={g.id} className="mt-1 text-sm">{groundById(g.id).name}: <b>{g.count}টি বুকিং</b> • {fmt(g.total)}</p>)}
        </div>
      </div>
    </div>
  );
}
