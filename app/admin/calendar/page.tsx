"use client";
import { useEffect, useState } from "react";
import { GROUNDS, dateStr, fmt, slotLabel, type Booking } from "../../../lib/data";
import { loadBookingsAsync } from "../../../lib/db";

export default function AdminCalendar() {
  const [list, setList] = useState<Booking[]>([]);
  useEffect(() => {
    let alive = true;
    loadBookingsAsync().then((list) => { if (alive) setList(list); });
    return () => { alive = false; };
  }, []);
  const days: { value: string; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    days.push({ value: dateStr(d), label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) });
  }
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-green-950">সপ্তাহের ক্যালেন্ডার</h1>
      <p className="text-sm text-slate-500">আগামী ৭ দিন — কোন মাঠে কখন কে খেলবে</p>
      <div className="mt-5 space-y-4">
        {days.map((d) => {
          const dayBookings = list.filter((b) => b.date === d.value && b.status !== "cancelled");
          return (
            <div key={d.value} className="rounded-2xl bg-white p-5 shadow">
              <h2 className="font-bold">{d.label} <span className="font-normal text-slate-500">— {dayBookings.length}টি বুকিং</span></h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {GROUNDS.map((g) => {
                  const gb = dayBookings.filter((b) => b.groundId === g.id);
                  return (
                    <div key={g.id} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-sm font-bold">{g.name} ({g.format})</p>
                      {gb.length === 0 ? <p className="mt-1 text-xs text-slate-400">কোনো বুকিং নেই — সব স্লট খালি</p> :
                        gb.map((b) => <p key={b.id} className="mt-1 text-xs"><b>{b.hours.map(slotLabel).join(", ")}</b> — {b.team} • {fmt(b.total)} • বাকি {fmt(b.due)}</p>)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
