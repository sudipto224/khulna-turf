"use client";
import { fmt, isPeak, priceForSlot, slotHours, slotLabel } from "../lib/data";

type Props = {
  booked: number[]; // 90-min slot indices 0–15
  blocked: number[];
  past: number[]; // today's slots whose end time has already passed
  selected: number[];
  onToggle: (slot: number) => void;
  disabled?: boolean;
  // When false, blocked slots stay clickable (admin unblock) while still
  // rendering amber/"বন্ধ". Default true keeps them unselectable (booking).
  disableBlocked?: boolean;
  // Admin-only: when provided, renders a sibling "Start/Stop maintenance"
  // button per slot (never nested inside the card button). Booking page
  // omits it, so its markup and behaviour are unchanged.
  onMaintenance?: (slot: number, currentlyBlocked: boolean) => void;
};

export default function SlotGrid({ booked, blocked, past, selected, onToggle, disabled, disableBlocked = true, onMaintenance }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {slotHours().map((h) => {
          const isBooked = booked.includes(h);
          const isBlocked = blocked.includes(h);
          const isPast = past.includes(h);
          const isSel = selected.includes(h);
          const peak = isPeak(h);
          const card = (
            <button
              key={h}
              type="button"
              disabled={disabled || isBooked || (disableBlocked !== false && isBlocked) || isPast}
              title={isPast ? "সময় পার হয়ে গেছে" : isBooked ? "এই স্লটটি ইতিমধ্যে বুকড" : isBlocked ? "এই স্লটটি বন্ধ আছে (মেইনটেন্যান্স)" : isSel ? "নির্বাচিত — আবার চাপলে বাতিল হবে" : `${slotLabel(h)} — ${fmt(priceForSlot(h))} / স্লট`}
              aria-label={isPast ? `${slotLabel(h)} — সময় শেষ` : isBooked ? `${slotLabel(h)} — বুকড` : isBlocked ? `${slotLabel(h)} — বন্ধ` : `${slotLabel(h)} — ${fmt(priceForSlot(h))}`}
              onClick={() => onToggle(h)}
              className={`rounded-xl border-2 p-3 text-left transition ${
                isSel ? "border-lime-500 bg-lime-400 text-green-950 shadow"
                : isBooked ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                : isBlocked ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700"
                : isPast ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                : "border-green-200 bg-white hover:border-lime-500 hover:bg-lime-50"
              }`}
            >
              <span className="block text-sm font-bold">{slotLabel(h)}</span>
              <span className="block text-xs">{isBooked ? "বুকড" : isBlocked ? "বন্ধ" : isPast ? "সময় শেষ" : `${fmt(priceForSlot(h))} / স্লট`}</span>
              {peak && !isBooked && !isBlocked && !isPast && <span className="mt-1 inline-block rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">PEAK</span>}
            </button>
          );
          if (onMaintenance) {
            return (
              <div key={h} className="flex flex-col items-center gap-1">
                {card}
                <button
                  type="button"
                  onClick={() => onMaintenance(h, isBlocked)}
                  className="mt-1 text-xs rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50"
                >
                  {isBlocked ? "Stop maintenance" : "Start maintenance"}
                </button>
              </div>
            );
          }
          return card;
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
        <span>🟢 <b>খালি</b></span><span>🔴 <b>বুকড</b></span><span>🟡 <b>বন্ধ / মেইনটেন্যান্স</b></span><span>⚫ <b>সময় শেষ</b></span><span>🟩 <b>নির্বাচিত</b></span>
      </div>
    </div>
  );
}
