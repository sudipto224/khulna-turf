import Link from "next/link";
import { notFound } from "next/navigation";
import { GROUNDS, TURF, fmt } from "../../../lib/data";
import { getSettings } from "../../../lib/db";

export default async function GroundDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = GROUNDS.find((x) => x.id === id);
  if (!g) return notFound();
  const settings = await getSettings();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <Link href="/grounds" className="text-sm font-bold text-green-700">← সব মাঠ দেখুন</Link>
      <div className="mt-4 overflow-hidden rounded-3xl text-white" style={{ background: g.gradient }}>
        <div className="p-8 md:p-10">
          <p className="text-6xl">{g.emoji}</p>
          <h1 className="mt-2 text-4xl font-extrabold">{g.name} — {g.format}</h1>
          <p className="mt-1 opacity-90">{g.size} • {g.surface} • {g.capacity} • 📍 {TURF.addressShort}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow md:col-span-2">
          <h2 className="text-xl font-bold">মাঠ সম্পর্কে</h2>
          <p className="mt-2 text-slate-600">{g.description}</p>
          <h3 className="mt-6 font-bold">সুবিধা</h3>
          <div className="mt-2 flex flex-wrap gap-2">{g.facilities.map((f) => <span key={f} className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-800">{f}</span>)}</div>
          <h3 className="mt-6 font-bold">গ্যালারি</h3>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-28 items-center justify-center rounded-xl text-3xl text-white" style={{ background: g.gradient, opacity: 0.85 + i * 0.05 }}>⚽</div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">TODO: এখানে মাঠের আসল ছবি বসবে (Supabase Storage / আপলোড)।</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="font-bold">ভাড়া</h3>
          <p className="mt-3">অফ-পিক: <b className="text-green-800">{fmt(settings.offPeak)}/৯০ মিনিটের স্লট</b><br /><span className="text-xs text-slate-500">রাত ১২টা – বিকেল ৪টা শুরু হওয়া স্লট</span></p>
          <p className="mt-3">পিক: <b className="text-orange-700">{fmt(settings.peak)}/৯০ মিনিটের স্লট</b><br /><span className="text-xs text-slate-500">বিকেল ৪টা – রাত ১০টা শুরু হওয়া স্লট</span></p>
          <p className="mt-3 text-sm">অ্যাডভান্স: মোটের ৫০% — বাকি ৫০% মাঠে।</p>
          <Link href={`/booking?ground=${g.id}`} className="mt-5 block rounded-xl bg-lime-400 py-3 text-center font-bold text-green-950">এই মাঠ বুক করুন →</Link>
          <Link href="/booking" className="mt-2 block rounded-xl bg-slate-100 py-3 text-center font-bold">সব স্লট দেখুন</Link>
          <p className="mt-4 text-xs text-slate-500">📍 {TURF.address}<br />📞 {TURF.phone}<br />🕖 {TURF.openingHours}</p>
        </div>
      </div>
    </main>
  );
}
