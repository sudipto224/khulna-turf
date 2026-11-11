"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import OfferBanner from "../../components/OfferBanner";
import SlotGrid from "../../components/SlotGrid";
import { GROUNDS, PRICING, dateStr, fmt, groundById, nextDays, prettyDate, isPeak, slotEndMinutes, slotHours, slotLabel, type Booking } from "../../lib/data";
import { blockedKey, loadBlocked, makeBookingId } from "../../lib/store";
import { createBooking, getBookedSlots, getBlockedSlots, getSettings, type Settings } from "../../lib/db";
import { getCurrentUser, refreshSession, type AuthUser } from "../../lib/auth";

const METHODS = [
  { id: "bKash", label: "bKash", color: "bg-pink-600", note: "পার্সোনাল নম্বরে Send Money" },
  { id: "Nagad", label: "Nagad", color: "bg-orange-500", note: "পার্সোনাল নম্বরে Send Money" },
  { id: "Rocket", label: "Rocket", color: "bg-purple-600", note: "ডাচ-বাংলা রকেট" },
  { id: "Card", label: "Card / SSLCommerz", color: "bg-blue-600", note: "কার্ড / মোবাইল ব্যাংকিং" },
];

function BookingInner() {
  const params = useSearchParams();
  const [groundId, setGroundId] = useState(params.get("ground") || "ground-a");
  const [date, setDate] = useState(dateStr(new Date()));
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [method, setMethod] = useState("bKash");
  const [paying, setPaying] = useState(false);
  const [formError, setFormError] = useState("");
  const phoneDigits = phone.replace(/[-\s]/g, "");
  // Visible validation — never fail silently (v4 fix: confirm used to return
  // with no feedback when the name was empty or the phone format was wrong).
  const validateInfo = (): string | null => {
    if (!name.trim()) return "নাম দিন";
    if (!/^01[3-9]\d{8}$/.test(phoneDigits)) return "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01 দিয়ে শুরু)";
    return null;
  };
  const [done, setDone] = useState<Booking | null>(null);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<number[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  // v5: booking needs a logged-in user. authChecked avoids flashing the
  // login prompt while the session is still being restored.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    const fetchBlocked = async () => {
      const slots = await getBlockedSlots(groundId, date);
      if (alive) setBlockedSlots(slots);
    };
    fetchBlocked();
    return () => { alive = false; };
  }, [groundId, date]);
  useEffect(() => {
    let alive = true;
    const fetchBooked = async () => {
      const slots = await getBookedSlots(groundId, date);
      if (alive) setBookedSlots(slots);
    };
    fetchBooked();
    return () => { alive = false; };
  }, [groundId, date]);
  useEffect(() => {
    let alive = true;
    void refreshSession().then((u) => {
      if (!alive) return;
      setUser(u ?? getCurrentUser());
      setAuthChecked(true);
    });
    return () => { alive = false; };
  }, []);
  // Pre-fill the form from the logged-in account (v5).
  useEffect(() => {
    if (!user) return;
    setName((n) => n || user.name);
    setPhone((p) => p || user.phone);
  }, [user]);
  useEffect(() => {
    let alive = true;
    getSettings().then((s) => { if (alive) setSettings(s); });
    return () => { alive = false; };
  }, []);
  const ground = groundById(groundId);
  const booked = bookedSlots;
  const blockedHours = blockedSlots;
  const nowMinutes = () => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  };
  const isToday = date === dateStr(new Date());
  const past = useMemo(() => {
    if (!isToday) return [];
    return slotHours().filter((h) => slotEndMinutes(h) <= nowMinutes());
  }, [date, isToday]);
  const total = selected.reduce((s, h) => s + (isPeak(h) ? (settings?.peak ?? PRICING.peakPerSlot) : (settings?.offPeak ?? PRICING.offPeakPerSlot)), 0);
  const advance = Math.round(total * PRICING.advancePercent / 100);
  const due = total - advance;

  const toggle = (h: number) => {
    if (past.includes(h)) return;
    setSelected((s) => s.includes(h) ? s.filter((x) => x !== h) : [...s, h].sort((a, b) => a - b));
  };

  const confirmPayment = () => {
    // v3: বুকিং lib/db.ts adapter দিয়ে তৈরি হয় — Supabase থাকলে সেখানে,
    // না থাকলে আগের মতো localStorage-এ (demo mode)।
    // আসল পেমেন্ট চালু হলে: আগে /api/payment/init-এ SSLCommerz session
    // শুরু করো, gateway-তে redirect করো; success callback-এ বুকিং "paid" হবে।
    // Env vars না থাকলে /api/payment/init PAYMENT_NOT_CONFIGURED ফেরত দেয়,
    // তখন নিচের demo flow চলে — কোনো আসল টাকা যায় না।
    // v4 fix: validation failure now shows a visible error and (if needed)
    // sends the user back to the form step — it never silently does nothing.
    const err = validateInfo();
    if (err) { setFormError(err); setStep(2); return; }
    if (!selected.length) { setFormError("কোনো স্লট নির্বাচিত হয়নি — আগে একটি স্লট বেছে নিন।"); setStep(1); return; }
    if (isToday && selected.some((h) => slotEndMinutes(h) <= nowMinutes())) {
      setFormError("একটি স্লটের সময় পার হয়ে গেছে — অন্য স্লট বেছে নিন।");
      setStep(1);
      return;
    }
    if (selected.some((h) => blockedSlots.includes(h))) {
      setFormError("এই স্লটটি বন্ধ আছে — অন্য স্লট বেছে নিন।");
      setStep(1);
      return;
    }
    setFormError("");
    setPaying(true);
    const booking: Booking = {
      id: makeBookingId(), groundId, date, hours: selected, name: name.trim(), phone: phone.trim(),
      team: team.trim() || "—", total, advance, due, method, status: "confirmed", createdAt: dateStr(new Date()),
      userId: user?.id, // v5: booking belongs to the logged-in user
    };
    // Card / SSLCommerz বেছে থাকলে আগে আসল গেটওয়ে চেষ্টা করো।
    const tryRealPayment = async (): Promise<boolean> => {
      if (method !== "Card") return false;
      try {
        const res = await fetch("/api/payment/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tranId: booking.id,
            amount: advance,
            customerName: booking.name,
            customerPhone: booking.phone,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; gatewayUrl?: string };
        if (res.ok && data.ok && data.gatewayUrl) {
          await createBooking({ ...booking, status: "pending" });
          window.location.href = data.gatewayUrl;
          return true;
        }
      } catch {
        // গেটওয়ে না থাকলে / নেটওয়ার্ক সমস্যায় demo flow-তেই যাবে।
      }
      return false;
    };
    void (async () => {
      try {
        if (await tryRealPayment()) return;
        await new Promise((r) => setTimeout(r, 1200)); // demo processing
        await createBooking(booking);
        const slots = await getBookedSlots(groundId, date);
        setBookedSlots(slots);
        setDone(booking);
        setStep(4);
      } catch {
        // v4 fix: a failed save used to leave the button spinning forever.
        setFormError("বুকিং করা যায়নি — আবার চেষ্টা করুন।");
      } finally {
        setPaying(false);
      }
    })();
  };

  if (step === 4 && done) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl animate-pop">
          <p className="text-6xl">✅</p>
          <h1 className="mt-3 text-3xl font-extrabold text-green-800">বুকিং কনফার্ম হয়েছে!</h1>
          <p className="mt-1 text-slate-600">অভিনন্দন, {done.name}! আপনার স্লটটি সংরক্ষিত।</p>
          <div className="mx-auto mt-6 flex h-36 w-36 flex-col items-center justify-center rounded-2xl border-4 border-green-900 bg-white">
            <span className="text-4xl">▦</span>            <span className="mt-1 px-2 text-center text-[10px] font-bold">QR CODE<br />মাঠে দেখান</span>
          </div>
          <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-5 text-left text-sm">
            <p><b>বুকিং আইডি:</b> {done.id}</p>
            <p><b>মাঠ:</b> {groundById(done.groundId).name} ({groundById(done.groundId).format})</p>
            <p><b>তারিখ:</b> {prettyDate(done.date)}</p>
            <p><b>সময়:</b> {done.hours.map(slotLabel).join(", ")}</p>
            <p><b>টিম:</b> {done.team}</p>
            <p><b>মোট:</b> {fmt(done.total)} • <b>অ্যাডভান্স ({done.method}):</b> {fmt(done.advance)} • <b>বাকি:</b> <span className="text-orange-700">{fmt(done.due)}</span></p>
          </div>
          <p className="mt-4 text-xs text-slate-500">📩 কনফার্মেশন SMS / হোয়াটসঅ্যাপে পাঠানো হবে (প্রোডাকশনে)। বাকি {fmt(done.due)} মাঠে গিয়ে ক্যাশে দিতে হবে। খেলার ৬ ঘণ্টা আগে ক্যানসেল করলে অ্যাডভান্স ফেরতযোগ্য।</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/my-bookings" className="rounded-xl bg-green-900 px-5 py-3 font-bold text-white">আমার বুকিং দেখুন</Link>
            <Link href="/booking" onClick={() => { setStep(1); setSelected([]); setDone(null); }} className="rounded-xl bg-lime-400 px-5 py-3 font-bold text-green-950">আরেকটি বুক করুন</Link>
          </div>
        </div>
      </main>
    );
  }

  // v5: guests can browse everything else as a demo, but booking needs
  // a login. Guests see a clear prompt and return here after logging in.
  if (!authChecked) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="rounded-3xl bg-white p-10 text-center shadow">লোড হচ্ছে…</p>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-5xl">🔐</p>
          <h1 className="mt-3 text-3xl font-extrabold text-green-950">বুক করতে লগইন করুন</h1>
          <p className="mt-2 text-slate-600">
            স্লট বুক করতে আপনার অ্যাকাউন্টে লগইন করতে হবে। মাঠ, ভাড়া আর সব
            তথ্য লগইন ছাড়াই দেখতে পারবেন।
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login?next=/booking" className="rounded-xl bg-lime-400 px-6 py-3 font-bold text-green-950">
              লগইন করুন
            </Link>
            <Link href="/register?next=/booking" className="rounded-xl bg-green-900 px-6 py-3 font-bold text-white">
              রেজিস্টার করুন
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-green-950">স্লট বুক করুন</h1>
      <p className="mt-1 text-slate-600">ধাপ {step} / ৩ — মাঠ ও সময় বাছুন → তথ্য দিন → অ্যাডভান্স পেমেন্ট</p>
      <p className="mt-1 text-sm text-green-800">👤 লগইন করেছেন: <b>{user.name}</b> ({user.phone})</p>
      <div className="mt-5"><OfferBanner /></div>

      <div className="mt-6 flex gap-2">
        {["মাঠ ও স্লট", "আপনার তথ্য", "পেমেন্ট"].map((s, i) => (
          <span key={s} className={`flex-1 rounded-full py-2 text-center text-xs font-bold ${step > i ? "bg-lime-400 text-green-950" : "bg-slate-200 text-slate-500"}`}>{i + 1}. {s}</span>
        ))}
      </div>

      {step === 1 && (
        <div className="mt-6 rounded-3xl bg-white p-6 shadow">
          <label className="text-sm font-bold">মাঠ নির্বাচন করুন</label>
          <div className="mt-2 rounded-2xl border-2 border-lime-500 bg-lime-50 p-4 text-left">
            <span className="text-2xl">⚽</span> <b>Ground — 7-a-side</b><br />
            <span className="text-sm text-slate-500">40m × 25m • {fmt(settings?.offPeak ?? PRICING.offPeakPerSlot)}–{fmt(settings?.peak ?? PRICING.peakPerSlot)}/৯০ মিনিটের স্লট</span>
          </div>
          <label className="mt-6 block text-sm font-bold">তারিখ নির্বাচন করুন</label>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {nextDays(14).map((d) => (
              <button key={d.value} onClick={() => { setDate(d.value); setSelected([]); }} className={`min-w-16 rounded-xl border-2 px-3 py-2 text-center ${date === d.value ? "border-lime-500 bg-lime-400 font-bold text-green-950" : "border-slate-200 bg-white"}`}>
                <span className="block text-xs">{d.day}</span><span className="block text-sm font-bold">{d.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500">{prettyDate(date)} • {ground.name} • প্রতিটি স্লট ৯০ মিনিটের, দিনে ১৬টি (রাত ১২টা – রাত ১১:৫৯)</p>
          <div className="mt-4"><SlotGrid booked={booked} blocked={blockedHours} past={past} selected={selected} onToggle={toggle} /></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
            <p>নির্বাচিত: <b>{selected.length ? selected.map(slotLabel).join(", ") : "কোনো স্লট নির্বাচিত হয়নি"}</b><br /><span className="text-sm text-slate-500">মোট: </span><b className="text-xl text-green-800">{fmt(total)}</b></p>
            <button disabled={!selected.length} onClick={() => setStep(2)} className="rounded-xl bg-green-900 px-6 py-3 font-bold text-white disabled:opacity-40">পরবর্তী ধাপ →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 rounded-3xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">আপনার তথ্য</h2>
          <p className="mt-1 text-sm text-slate-500">{ground.name} • {prettyDate(date)} • {selected.map(slotLabel).join(", ")} • মোট {fmt(total)}</p>
          <label className="mt-5 block text-sm font-bold">আপনার নাম *</label>
          <input value={name} onChange={(e) => { setName(e.target.value); setFormError(""); }} placeholder="যেমন: সাকিব রহমান" className="mt-1 w-full rounded-lg border px-3 py-2.5" />
          <label className="mt-4 block text-sm font-bold">মোবাইল নম্বর *</label>
          <input value={phone} onChange={(e) => { setPhone(e.target.value); setFormError(""); }} placeholder="01XXXXXXXXX" inputMode="tel" className="mt-1 w-full rounded-lg border px-3 py-2.5" />
          <p className="text-xs text-slate-400">বাংলাদেশি ফরম্যাট: 01 দিয়ে শুরু, ১১ সংখ্যা। কনফার্মেশন এই নম্বরে যাবে।</p>
          {formError && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200">⚠️ {formError}</p>}
          <label className="mt-4 block text-sm font-bold">টিমের নাম</label>
          <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="যেমন: Khulna Warriors" className="mt-1 w-full rounded-lg border px-3 py-2.5" />
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(1)} className="rounded-xl bg-slate-100 px-5 py-3 font-bold">← ফিরে যান</button>
            <button onClick={() => { const e = validateInfo(); if (e) { setFormError(e); return; } setFormError(""); setStep(3); }} className="flex-1 rounded-xl bg-green-900 py-3 font-bold text-white">পেমেন্টে যান →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 rounded-3xl bg-white p-6 shadow">
          <h2 className="mt-5 text-xl font-bold">অ্যাডভান্স পেমেন্ট</h2>
          <p className="text-sm text-slate-500">মোট {fmt(total)} — অ্যাডভান্স দিয়ে স্লট কনফার্ম করুন, বাকি {fmt(due)} মাঠে দেবেন।</p>
          <div className="mt-4 rounded-2xl border-2 border-lime-500 bg-lime-50 p-4 text-left">
            <b>৫০% অ্যাডভান্স</b><p className="text-2xl font-extrabold text-green-800">{fmt(advance)}</p><p className="text-xs text-slate-500">বাকি {fmt(due)} মাঠে</p>
          </div>
          <h3 className="mt-6 font-bold">পেমেন্ট মাধ্যম</h3>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {METHODS.map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`rounded-xl border-2 p-3 text-center ${method === m.id ? "border-lime-500 bg-lime-50" : "border-slate-200"}`}>
                <span className={`inline-block rounded px-2 py-1 text-xs font-bold text-white ${m.color}`}>{m.label}</span>
                <span className="mt-1 block text-[11px] text-slate-500">{m.note}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
            <p>নাম: {name} • ফোন: {phone} • টিম: {team || "—"}</p>
            <p className="mt-1">মোট {fmt(total)} • অ্যাডভান্স <b>{fmt(advance)}</b> ({method}) • বাকি <b className="text-orange-700">{fmt(due)}</b></p>
          </div>
          {formError && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200">⚠️ {formError}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={() => setStep(2)} className="rounded-xl bg-slate-100 px-5 py-3 font-bold">← ফিরে যান</button>
            <button onClick={confirmPayment} disabled={paying} className="flex-1 rounded-xl bg-lime-400 py-3 font-bold text-green-950 disabled:opacity-60">
              {paying ? "পেমেন্ট প্রসেস হচ্ছে…" : `৳${advance} পেমেন্ট করে বুকিং কনফার্ম করুন`}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function BookingPage() {
  return <Suspense fallback={<div className="p-10 text-center">লোড হচ্ছে…</div>}><BookingInner /></Suspense>;
}
