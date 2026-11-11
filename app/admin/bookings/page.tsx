"use client";
import { useEffect, useMemo, useState } from "react";
import { fmt, groundById, prettyDate, slotLabel, type Booking } from "../../../lib/data";
import { loadBookingsAsync, updateBookingStatus } from "../../../lib/db";

export default function AdminBookings() {
  const [list, setList] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  useEffect(() => {
    let alive = true;
    loadBookingsAsync().then((list) => { if (alive) setList(list); });
    return () => { alive = false; };
  }, []);
  const shown = useMemo(() => list.filter((b) =>
    (filter === "all" || b.status === filter) &&
    (!q || b.team.toLowerCase().includes(q.toLowerCase()) || b.name.toLowerCase().includes(q.toLowerCase()) || b.id.toLowerCase().includes(q.toLowerCase()))
  ), [list, filter, q]);
  const act = async (id: string, patch: Partial<Booking>) => {
    const next = await updateBookingStatus(id, patch);
    setList(next);
  };
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-green-950">বুকিংসমূহ ({shown.length})</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="টিম / নাম / আইডি খুঁজুন…" className="rounded-lg border bg-white px-3 py-2 text-sm" />
        {["all", "confirmed", "pending", "paid", "cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === f ? "bg-green-900 text-white" : "bg-white"}`}>{f === "all" ? "সবগুলো" : f}</button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-green-950 text-white"><tr><th className="px-3 py-3">বুকিং</th><th className="px-3 py-3">মাঠ / সময়</th><th className="px-3 py-3">কাস্টমার</th><th className="px-3 py-3">টাকা</th><th className="px-3 py-3">স্ট্যাটাস</th><th className="px-3 py-3">অ্যাকশন</th></tr></thead>
          <tbody>
            {shown.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-3 py-3 font-mono text-xs">{b.id}<br /><span className="text-slate-500">{b.createdAt}</span></td>
                <td className="px-3 py-3">{groundById(b.groundId).name}<br /><span className="text-slate-500">{prettyDate(b.date)}</span><br />{b.hours.map(slotLabel).join(", ")}</td>
                <td className="px-3 py-3"><b>{b.team}</b><br />{b.name}<br /><span className="text-slate-500">{b.phone}</span></td>
                <td className="px-3 py-3">মোট {fmt(b.total)}<br />অ্যাডভান্স {fmt(b.advance)} ({b.method})<br /><b className="text-orange-700">বাকি {fmt(b.due)}</b></td>
                <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${b.status === "cancelled" ? "bg-red-100 text-red-700" : b.status === "paid" ? "bg-green-100 text-green-800" : "bg-lime-100 text-green-800"}`}>{b.status}</span></td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    {b.status === "pending" && <button onClick={() => act(b.id, { status: "confirmed" })} className="rounded bg-lime-400 px-2 py-1 text-xs font-bold">কনফার্ম</button>}
                    {b.status !== "paid" && b.status !== "cancelled" && <button onClick={() => act(b.id, { status: "paid", due: 0 })} className="rounded bg-green-800 px-2 py-1 text-xs font-bold text-white">বাকি পরিশোধ ✓</button>}
                    {b.status !== "cancelled" && <button onClick={() => act(b.id, { status: "cancelled" })} className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-700">বাতিল</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <p className="p-6 text-center text-slate-500">কোনো বুকিং পাওয়া যায়নি।</p>}
      </div>
    </div>
  );
}
