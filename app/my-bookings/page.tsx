"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt, groundById, isBookingOwner, prettyDate, slotLabel, type Booking } from "../../lib/data";
import { loadBookings, updateBooking } from "../../lib/store";
import { getCurrentUser, refreshSession, type AuthUser } from "../../lib/auth";

export default function MyBookingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [list, setList] = useState<Booking[]>([]);

  useEffect(() => {
    let alive = true;
    void refreshSession().then((u) => {
      if (!alive) return;
      setUser(u ?? getCurrentUser());
      setAuthChecked(true);
    });
    return () => { alive = false; };
  }, []);
  // v5: only the current user's own bookings — never anyone else's.
  // Seed bookings without a userId belong to the user whose phone matches.
  useEffect(() => {
    if (!user) { setList([]); return; }
    setList(loadBookings().filter((b) => isBookingOwner(b, user)));
  }, [user]);

  const cancel = (id: string) => {
    if (!confirm("এই বুকিংটি বাতিল করবেন? খেলার ৬ ঘণ্টা আগে ক্যানসেল করলে অ্যাডভান্স ফেরতযোগ্য।")) return;
    const next = updateBooking(id, { status: "cancelled" });
    if (user) setList(next.filter((b) => isBookingOwner(b, user)));
  };

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="rounded-2xl bg-white p-8 text-center shadow">লোড হচ্ছে…</p>
      </main>
    );
  }

  // v5: guests see a login prompt — never anyone's bookings.
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-green-950">আমার বুকিংসমূহ</h1>
        <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-5xl">🔐</p>
          <h2 className="mt-3 text-2xl font-extrabold text-green-950">আপনার বুকিং দেখতে লগইন করুন</h2>
          <p className="mt-2 text-slate-600">
            আপনার বুকিংগুলো শুধু আপনিই দেখতে পারবেন। লগইন করলে এখানে আপনার
            নিজের বুকিংগুলো দেখাবে।
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login?next=/my-bookings" className="rounded-xl bg-lime-400 px-6 py-3 font-bold text-green-950">
              লগইন করুন
            </Link>
            <Link href="/register?next=/my-bookings" className="rounded-xl bg-green-900 px-6 py-3 font-bold text-white">
              রেজিস্টার করুন
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-green-950">আমার বুকিংসমূহ</h1>
      <p className="mt-1 text-slate-600">👤 {user.name} ({user.phone}) — এখানে শুধু আপনার নিজের বুকিংগুলো দেখাচ্ছে।</p>
      {!list.length && <p className="mt-8 rounded-2xl bg-white p-8 text-center shadow">এখনো কোনো বুকিং নেই। <Link href="/booking" className="font-bold text-green-700 underline">এখনই বুক করুন →</Link></p>}
      <div className="mt-6 space-y-4">
        {list.map((b) => (
          <article key={b.id} className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{b.id} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${b.status === "cancelled" ? "bg-red-100 text-red-700" : b.status === "paid" ? "bg-green-100 text-green-800" : "bg-lime-100 text-green-800"}`}>{b.status === "cancelled" ? "বাতিল" : b.status === "paid" ? "পরিশোধিত" : "কনফার্মড"}</span></p>
                <p className="mt-1 text-sm text-slate-600">{groundById(b.groundId).name} • {prettyDate(b.date)} • {b.hours.map(slotLabel).join(", ")}</p>
                <p className="text-sm text-slate-600">{b.name} • {b.phone} • টিম: {b.team}</p>
                <p className="mt-1 text-sm">মোট {fmt(b.total)} • অ্যাডভান্স {fmt(b.advance)} ({b.method}) • বাকি <b className="text-orange-700">{fmt(b.due)}</b></p>
              </div>
              {b.status !== "cancelled" && <button onClick={() => cancel(b.id)} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-700">বাতিল করুন</button>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
