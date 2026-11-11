import Link from "next/link";
import OfferBanner from "../../components/OfferBanner";
import { fmt, isPeak, slotHours, slotLabel } from "../../lib/data";
import { getSettings } from "../../lib/db";

export default async function PricingPage() {
  const settings = await getSettings();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="eyebrow">ভাড়ার তালিকা</p>
      <h1 className="section-title mt-1">প্রতি ৯০ মিনিটের স্লটের ভাড়া</h1>
      <p className="mt-1 text-slate-600">সব দাম বাংলাদেশি টাকায় (৳), প্রতি ৯০ মিনিটের স্লটের জন্য। দাম পরিবর্তন মালিক /admin/settings থেকে করতে পারবেন।</p>
      <div className="mt-5"><OfferBanner /></div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-6"><h2 className="font-bold text-slate-500">অফ-পিক</h2><p className="mt-2 text-4xl font-extrabold text-green-800">{fmt(settings.offPeak)}<span className="text-base font-normal"> / স্লট</span></p><p className="text-sm text-slate-500">রাত ১২টা – বিকেল ৪টা, এবং রাত ১০টা – রাত ১১:৫৯</p></div>
        <div className="card !border-orange-200 bg-orange-50/60 p-6"><h2 className="font-bold text-orange-700">পিক</h2><p className="mt-2 text-4xl font-extrabold text-orange-700">{fmt(settings.peak)}<span className="text-base font-normal"> / স্লট</span></p><p className="text-sm text-slate-500">বিকেল ৪টা – রাত ১০টায় শুরু হওয়া স্লট</p></div>
      </div>
      <div className="card mt-6 overflow-x-auto !rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#052e16] text-white"><tr><th className="px-4 py-3">স্লট (৯০ মিনিট)</th><th className="px-4 py-3">ধরন</th><th className="px-4 py-3">Ground</th></tr></thead>
          <tbody>
            {slotHours().map((s) => {
              const peak = isPeak(s);
              const price = isPeak(s) ? settings.peak : settings.offPeak;
              return <tr key={s} className="border-t border-slate-100 transition hover:bg-lime-50/50"><td className="px-4 py-2.5 font-semibold">{slotLabel(s)}</td><td className="px-4 py-2.5">{peak ? "🔥 পিক" : "অফ-পিক"}</td><td className="px-4 py-2.5">{fmt(price)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="card mt-6 p-6">
        <h2 className="font-bold">অ্যাডভান্স ও অন্যান্য</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>অ্যাডভান্স: মোটের ৫০%。</li>
          <li>পেমেন্ট: বিকাশ, নগদ, রকেট, কার্ড (SSLCommerz)।</li>
          <li>ক্যানসেল: খেলার ৬ ঘণ্টা আগে ক্যানসেল করলে অ্যাডভান্স ফেরতযোগ্য।</li>
        </ul>
        <Link href="/booking" className="btn-primary mt-5">এখনই বুক করুন →</Link>
      </div>
    </main>
  );
}
