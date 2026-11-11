import { TURF } from "../../lib/data";

export default function InfoPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-green-950">তথ্য, নিয়ম ও ক্যানসেল পলিসি</h1>
      <div className="mt-6 space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">📍 ঠিকানা ও সময়</h2>
          <p className="mt-2 text-slate-600">{TURF.address}</p>
          <p className="text-slate-600">📞 {TURF.phone} • ✉️ {TURF.email}</p>
          <p className="text-slate-600">🕖 {TURF.openingHours}</p>
          <a href={TURF.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-lg bg-green-900 px-4 py-2 text-sm font-bold text-white">গুগল ম্যাপে দেখুন</a>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">📜 মাঠের নিয়ম</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            <li>শুধুমাত্র ফুটবল জুতা / টার্ফ সু পরে মাঠে নামতে হবে। স্পাইকযুক্ত বুট নিষেধ।</li>
            <li>স্লট শুরুর ১৫ মিনিট আগে উপস্থিত থাকুন।</li>
            <li>মাঠে খাবার, ধূমপান ও মদ্যপান সম্পূর্ণ নিষেধ।</li>
            <li>মাঠের কোনো ক্ষতি হলে ক্ষতিপূরণ দিতে হবে।</li>
            <li>বুকিংয়ের সময় দেওয়া QR কোড / বুকিং আইডি মাঠে দেখাতে হবে।</li>
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">💸 ক্যানসেল ও রিফান্ড পলিসি</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            <li>খেলার <b>৬ ঘণ্টা আগে</b> ক্যানসেল করলে অ্যাডভান্স সম্পূর্ণ ফেরত দেওয়া হবে।</li>
            <li>৬ ঘণ্টার কম সময়ে ক্যানসেল করলে অ্যাডভান্স ফেরত দেওয়া হবে না।</li>
            <li>বৃষ্টি বা মাঠের সমস্যার কারণে মালিক বাতিল করলে সম্পূর্ণ টাকা ফেরত দেওয়া হবে।</li>
            <li>রিশিডিউল: খেলার ৬ ঘণ্টা আগে পর্যন্ত একবার বিনামূল্যে সময় বদলানো যাবে (স্লট খালি থাকা সাপেক্ষে)।</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
