"use client";
import { useEffect, useState } from "react";
import SlotGrid from "../../../components/SlotGrid";
import { GROUNDS, bookedHours, dateStr, nextDays, slotLabel, type Booking } from "../../../lib/data";
import { loadBookings } from "../../../lib/store";
import { getBlockedSlots, setBlockedSlot } from "../../../lib/db";

export default function AdminSlots() {
  const [groundId, setGroundId] = useState("ground-a");
  const [date, setDate] = useState(dateStr(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<number[]>([]);
  const [reason, setReason] = useState("Maintenance");
  useEffect(() => { setBookings(loadBookings()); }, []);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const slots = await getBlockedSlots(groundId, date);
      if (alive) setBlockedSlots(slots);
    };
    load();
    return () => { alive = false; };
  }, [groundId, date]);
  const booked = bookedHours(bookings, groundId, date);
  const toggleBlock = async (h: number) => {
    const currentlyBlocked = blockedSlots.includes(h);
    await setBlockedSlot(groundId, date, h, !currentlyBlocked, reason || "Maintenance");
    const slots = await getBlockedSlots(groundId, date);
    setBlockedSlots(slots);
  };
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-green-950">স্লট ও দাম ম্যানেজমেন্ট</h1>
      <p className="text-sm text-slate-500">কোনো স্লটে ক্লিক করলে সেটি বন্ধ / খোলা হবে। বুকড স্লট বন্ধ করা যাবে না। দাম বদলাতে সেটিংসে যান।</p>
      <div className="mt-5 rounded-2xl bg-white p-5 shadow">
        <div className="flex flex-wrap gap-3">
          <select value={groundId} onChange={(e) => setGroundId(e.target.value)} className="rounded-lg border px-3 py-2">
            {GROUNDS.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.format}</option>)}
          </select>
          <select value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border px-3 py-2">
            {nextDays(14).map((d) => <option key={d.value} value={d.value}>{d.label} ({d.day}) — {d.value}</option>)}
          </select>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="বন্ধের কারণ (যেমন: Maintenance)" className="rounded-lg border px-3 py-2" />
        </div>
        <div className="mt-5">
          <SlotGrid booked={booked} blocked={blockedSlots} past={[]} selected={[]} onToggle={toggleBlock} onMaintenance={toggleBlock} />
        </div>
        <p className="mt-4 text-sm text-slate-500">বন্ধ স্লটগুলো কাস্টমার সাইটে হলুদ রঙে “বন্ধ” দেখাবে। বর্তমানে এই তারিখে বন্ধ: {blockedSlots.length ? blockedSlots.map((h) => slotLabel(h)).join(", ") : "কোনোটিই নয়"}</p>
      </div>
    </div>
  );
}
