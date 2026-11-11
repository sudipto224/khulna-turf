"use client";
import { useEffect, useState } from "react";
import { getSettings, updateSettings, type Settings } from "../../../lib/db";

export default function AdminSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getSettings().then((settings) => { if (alive) setS(settings); });
    return () => { alive = false; };
  }, []);

  if (!s) return <div className="p-6">লোড হচ্ছে…</div>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSaved(false);
    setBusy(true);

    if (!s.address.trim()) { setErr("ঠিকানা খালি থাকা যাবে না।"); setBusy(false); return; }
    if (!/^01[3-9]\d{8}$/.test(s.phone.replace(/[-\s]/g, ""))) { setErr("ফোন নম্বর ১১ সংখ্যার হতে হবে (01 দিয়ে শুরু।"); setBusy(false); return; }
    if (typeof s.peak !== "number" || !Number.isFinite(s.peak) || s.peak <= 0) { setErr("পিক দাম শূন্য ]; বড় হতে হবে।"); setBusy(false); return; }
    if (typeof s.offPeak !== "number" || !Number.isFinite(s.offPeak) || s.offPeak <= 0) { setErr("অফ-পিক দাম শূন্য ]; বড় হতে হবে।"); setBusy(false); return; }

    const res = await updateSettings({ address: s.address.trim(), phone: s.phone.trim(), peak: s.peak, offPeak: s.offPeak });
    setBusy(false);
    if (!res.ok) { setErr(res.error || "সেভ করতে সমস্যা হচ্ছে।"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-green-950">সেটিংস</h1>
      <p className="text-sm text-slate-500">এখানে বদলানো তথ্য ডাটাবেসে সংরক্ষিত হবে। কাস্টমার সাইটের দাম এখান থেকে নেবে।</p>
      <form onSubmit={handleSave} className="mt-5 space-y-4 rounded-2xl bg-white p-6 shadow">
        <div><label className="text-sm font-bold">ঠিকানা</label><input value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5" /></div>
        <div><label className="text-sm font-bold">ফোন নম্বর</label><input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-bold">পিক দাম (৳/৯০ মিনিটের স্লট)</label><input type="number" value={s.peak} onChange={(e) => setS({ ...s, peak: Number(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border px-3 py-2.5" /></div>
          <div><label className="text-sm font-bold">অফ-পিক দাম (৳/৯০ মিনিটের স্লট)</label><input type="number" value={s.offPeak} onChange={(e) => setS({ ...s, offPeak: Number(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border px-3 py-2.5" /></div>
        </div>
        {err && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-lg bg-lime-400 py-3 font-bold text-green-950 hover:bg-lime-300 disabled:opacity-60">সংরক্ষণ করুন</button>
        {saved && <p className="text-sm font-bold text-green-700">✅ সেটিংস সংরক্ষিত হয়েছে!</p>}
      </form>
    </div>
  );
}
