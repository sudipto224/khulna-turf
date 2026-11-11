import Link from "next/link";
import { NOVEMBER_OFFER } from "../lib/data";

// Premium offer banner — dark pine with a restrained gold rule, not a loud sticker.
export default function OfferBanner() {
  return (
    <div className="rounded-2xl bg-[#052e16] px-5 py-4 text-white shadow-[0_12px_32px_-12px_rgba(5,46,22,.6)] ring-1 ring-[#c9a227]/50 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#c9a227]">November Special Offer</p>
          <p className="mt-1 text-base font-extrabold leading-snug sm:text-lg">
            নভেম্বরে ফ্ল্যাট <span className="text-lime-300">৳{NOVEMBER_OFFER.discount} ছাড়</span>
            <span className="font-normal text-green-100"> — রাত ১:৩০ থেকে বিকেল ৪:৩০ পর্যন্ত স্লটে</span>
          </p>
          <p className="mt-0.5 text-xs text-green-200">অফার চলবে {NOVEMBER_OFFER.dates} • বুকিং হটলাইন ০১৪০৭-৫০৫৪০৪</p>
        </div>
        <Link href="/booking" className="btn-primary shrink-0 !px-5 !py-2.5 text-sm">অফার স্লট বুক করুন →</Link>
      </div>
    </div>
  );
}
