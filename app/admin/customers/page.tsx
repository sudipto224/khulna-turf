"use client";
import { useEffect, useMemo, useState } from "react";
import { fmt, type Booking } from "../../../lib/data";
import { loadBookingsAsync } from "../../../lib/db";

export default function AdminCustomers() {
  const [list, setList] = useState<Booking[]>([]);
  useEffect(() => {
    let alive = true;
    loadBookingsAsync().then((list) => { if (alive) setList(list); });
    return () => { alive = false; };
  }, []);
  const rows = useMemo(() => {
    const map = new Map<string, { team: string; name: string; phone: string; count: number; spent: number; last: string }>();
    list.filter((b) => b.status !== "cancelled").forEach((b) => {
      const k = b.team + "|" + b.phone;
      const cur = map.get(k) || { team: b.team, name: b.name, phone: b.phone, count: 0, spent: 0, last: b.date };
      cur.count += 1; cur.spent += b.total; if (b.date > cur.last) cur.last = b.date;
      map.set(k, cur);
    });
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [list]);
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-green-950">কাস্টমার ও নিয়মিত টিম</h1>
      <p className="text-sm text-slate-500">{rows.length}টি টিম / কাস্টমার — যারা বেশি খেলে, তাদের ফিক্সড স্লট বা অফার দিন।</p>
      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-green-950 text-white"><tr><th className="px-4 py-3">টিম</th><th className="px-4 py-3">যোগাযোগ</th><th className="px-4 py-3">বুকিং</th><th className="px-4 py-3">মোট খরচ</th><th className="px-4 py-3">শেষ খেলা</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.team + r.phone} className="border-t">
                <td className="px-4 py-3 font-bold">{r.team} {r.count >= 3 && <span className="ml-1 rounded-full bg-lime-100 px-2 py-0.5 text-xs text-green-800">নিয়মিত ⭐</span>}</td>
                <td className="px-4 py-3">{r.name}<br /><span className="text-slate-500">{r.phone}</span></td>
                <td className="px-4 py-3">{r.count} বার</td>
                <td className="px-4 py-3 font-bold text-green-800">{fmt(r.spent)}</td>
                <td className="px-4 py-3">{r.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="p-6 text-center text-slate-500">কোনো কাস্টমার নেই।</p>}
      </div>
    </div>
  );
}
