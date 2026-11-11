// ─────────────────────────────────────────────────────────────
// Khulna Turf — single place to edit ALL client data.
// EDIT HERE for the real client: address, phone, prices, grounds.
// ─────────────────────────────────────────────────────────────

export const TURF = {
  name: "Khulna Turf",
  tagline: "খুলনার সেরা ফুটবল টার্ফ — খেলুন, জিতুন, উপভোগ করুন",
  taglineEn: "FOOTBALL • CRICKET • MORE",
  intro: "KEEP CALM AND PLAY CRICKET | KEEP CALM AND PLAY FOOTBALL",
  // Real data from Khulna Turf's Facebook page, collected 2026-11-05
  // (facebook.com/share/1F2CgpiPGV/ — 14K followers, category: Playground).
  // Real data from Khulna Turf's Facebook page and Google Maps, verified 2026-11-08
  address: "40-41, M A Bari Road, Gollamari Sonadanga Link Road, 9100, Khulna, Bangladesh",
  addressShort: "Gollamari, Khulna",
  googleMapsUrl: "https://www.google.com/maps/search/22.8105524,+89.5407334",
  latitude: 22.8105524,
  longitude: 89.5407334,
  phone: "01407-505404",
  whatsapp: "8801407505404", // digits only, for wa.me link — same hotline as phone; no separate WhatsApp number is listed on Facebook
  email: "khulnaturf@gmail.com",
  facebook: "https://www.facebook.com/share/1F2CgpiPGV/",
  openingHours: "Always open",
};

// Real slot info from Facebook (2026-11-05): 90-minute blocks, 16 slots/day,
// 12:00 AM–11:59 PM. Slot 15 is 10:30–11:59 PM (89 min, closes at midnight).
export const SLOT_INFO = {
  durationMinutes: 90,
  slotsPerDay: 16,
  dayStart: "12:00 AM",
  dayEnd: "11:59 PM",
  note: "প্রতিটি স্লট ৯০ মিনিটের; দিনে ১৬টি স্লট (রাত ১২টা – রাত ১১:৫৯)।",
};

// Real November offer from Facebook (2026-11-05): flat ৳600 off,
// 1:30 AM–4:30 PM slots, 1–30 Nov 2026.
export const NOVEMBER_OFFER = {
  discount: 600,
  window: "1:30 AM – 4:30 PM",
  dates: "1–30 Nov 2026",
  text: "নভেম্বরে ফ্ল্যাট ৳৬০০ ছাড় — রাত ১:৩০ থেকে বিকেল ৪:৩০ পর্যন্ত স্লটে (১–৩০ নভেম্বর)",
};

export type Ground = {
  id: string;
  name: string;
  short: string;
  format: string;
  size: string;
  surface: string;
  capacity: string;
  floodlight: boolean;
  gradient: string; // CSS gradient used as the cover photo (no external image)
  emoji: string;
  description: string;
  facilities: string[];
};

export const GROUNDS: Ground[] = [
  {
    id: "ground-a",
    name: "Ground",
    short: "7-a-side",
    format: "7-a-side",
    size: "40m × 25m",
    surface: "Premium Astroturf",
    capacity: "14 players",
    floodlight: true,
    gradient: "linear-gradient(135deg,#052e16 0%,#166534 55%,#65a30d 100%)",
    emoji: "⚽",
    description:
      "খুলনা টার্ফের বড় মাঠ — ৭-এ-সাইড ম্যাচ, টুর্নামেন্ট আর বড় টিমের জন্য সেরা। রাতে ফ্লাডলাইটে খেলার অভিজ্ঞতা একদম প্রফেশনাল।",
    facilities: ["Floodlight", "Astroturf", "Parking", "Washroom", "Changing Room", "Drinking Water", "Cafeteria", "Gallery", "CCTV Footage", "Cricket", "Football", "Swimming Pool Package"],
  },
];

// ── Pricing — DEMO PLACEHOLDERS, NOT from Facebook ───────────────
// TODO (client): regular slot prices are NOT published on Khulna Turf's
// Facebook page (checked 2026-11-05). The ৳800 / ৳1200 figures below are
// DEMO prices carried over from v1, now charged PER 90-MINUTE SLOT (not per
// hour). Confirm the real per-slot prices with the owner and edit here
// before showing this to the client as final. The November offer
// (flat ৳600 off, see NOVEMBER_OFFER above) IS real.
export const PRICING = {
  peakPerSlot: 1200, // slots starting 4 PM – 10 PM
  offPeakPerSlot: 800, // all other slots
  peakStartMinutes: 16 * 60,
  peakEndMinutes: 22 * 60, // peak = slot starts 16:00–22:00
  advancePercent: 50, // percent advance option
  currency: "৳",
};

// Slots are 90-minute blocks starting at midnight. A "slot" is identified by
// its index 0–15 everywhere in the code (Booking.hours, SlotGrid, admin).
export const SLOT_STARTS: number[] = [0, 90, 180, 270, 360, 450, 540, 630, 720, 810, 900, 990, 1080, 1170, 1260, 1350];
export function formatMinutes(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? "AM" : "PM";
  return m === 0 ? `${h} ${ampm}` : `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}
export function slotEndMinutes(slot: number): number {
  return slot === 15 ? 23 * 60 + 59 : SLOT_STARTS[slot] + 90; // last slot ends 11:59 PM
}
export function slotLabel(slot: number): string {
  return `${formatMinutes(SLOT_STARTS[slot])} – ${formatMinutes(slotEndMinutes(slot))}`;
}
export function slotHours(): number[] {
  return SLOT_STARTS.map((_, i) => i); // slot indices 0–15
}
export function priceForSlot(slot: number): number {
  return isPeak(slot) ? PRICING.peakPerSlot : PRICING.offPeakPerSlot;
}
export function isPeak(slot: number): boolean {
  const start = SLOT_STARTS[slot];
  return start >= PRICING.peakStartMinutes && start < PRICING.peakEndMinutes;
}
export const fmt = (n: number) => `৳${n.toLocaleString("en-IN")}`;

// ── Dates: next 14 days ──────────────────────────────────────
export function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function nextDays(n = 14): { value: string; label: string; day: string }[] {
  const out = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      value: dateStr(d),
      label: i === 0 ? "আজ" : i === 1 ? "আগামীকাল" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      day: d.toLocaleDateString("en-GB", { weekday: "short" }),
    });
  }
  return out;
}
export function prettyDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── Bookings ──────────────────────────────────────────────────
export type BookingStatus = "confirmed" | "pending" | "paid" | "cancelled";
export type Booking = {
  id: string;
  groundId: string;
  date: string; // YYYY-MM-DD
  hours: number[]; // 90-min slot indices 0–15, e.g. [10,11] = 3:00 PM–6:00 PM
  name: string;
  phone: string;
  team: string;
  total: number;
  advance: number;
  due: number;
  method: string;
  status: BookingStatus;
  createdAt: string;
  // v5: booking owner — the logged-in user's id (demo mode: their phone).
  // Bookings created before v5 / seed bookings have no userId; they are
  // treated as owned by the user whose phone matches (see My Bookings).
  userId?: string;
};

export const DEMO_ADMIN = { email: "admin@khulnaturf.com", password: "admin123" };

// Seed bookings — realistic demo data for Nov 2026, on the real 90-min slots.
// Old v1 1-hour seeds were mapped onto the overlapping 90-min blocks, and
// totals recomputed with the demo per-slot prices (peak ৳1200 / off-peak ৳800).
// TODO (production): replace with Supabase / Laravel API. Seed only loads
// into localStorage on first visit; user bookings are added on top.
export const SEED_BOOKINGS: Booking[] = [
  { id: "KT-20261105-1042", groundId: "ground-a", date: "2026-11-05", hours: [10, 11], name: "Rakib Hasan", phone: "01712-345678", team: "Khulna Warriors", total: 2000, advance: 1000, due: 1000, method: "bKash", status: "confirmed", createdAt: "2026-11-04" },
  { id: "KT-20261105-1043", groundId: "ground-a", date: "2026-11-05", hours: [12], name: "Tanvir Ahmed", phone: "01934-567890", team: "Tigers XI", total: 1200, advance: 1200, due: 0, method: "Nagad", status: "paid", createdAt: "2026-11-04" },
  { id: "KT-20261105-1044", groundId: "ground-b", date: "2026-11-05", hours: [12, 13], name: "Sakib Rahman", phone: "01556-789012", team: "Sonadanga FC", total: 2400, advance: 500, due: 1900, method: "bKash", status: "confirmed", createdAt: "2026-11-05" },
  { id: "KT-20261105-1045", groundId: "ground-b", date: "2026-11-05", hours: [5], name: "Mehedi Hasan", phone: "01877-123456", team: "Morning Stars", total: 800, advance: 500, due: 300, method: "Rocket", status: "confirmed", createdAt: "2026-11-03" },
  { id: "KT-20261105-1046", groundId: "ground-a", date: "2026-11-05", hours: [13], name: "Arif Billah", phone: "01698-234567", team: "Green Falcons", total: 1200, advance: 600, due: 600, method: "bKash", status: "pending", createdAt: "2026-11-05" },
  { id: "KT-20261106-1051", groundId: "ground-a", date: "2026-11-06", hours: [10, 11, 12], name: "Naimul Islam", phone: "01745-678901", team: "Khulna Warriors", total: 3200, advance: 1600, due: 1600, method: "Nagad", status: "confirmed", createdAt: "2026-11-05" },
  { id: "KT-20261106-1052", groundId: "ground-b", date: "2026-11-06", hours: [11], name: "Fahim Chowdhury", phone: "01921-345678", team: "Rupsha Rovers", total: 1200, advance: 1200, due: 0, method: "Card", status: "paid", createdAt: "2026-11-04" },
  { id: "KT-20261106-1053", groundId: "ground-a", date: "2026-11-06", hours: [6, 7], name: "Shakil Khan", phone: "01533-456789", team: "Bagerhat Boys", total: 1600, advance: 500, due: 1100, method: "bKash", status: "confirmed", createdAt: "2026-11-05" },
  { id: "KT-20261107-1061", groundId: "ground-a", date: "2026-11-07", hours: [10], name: "Hasan Mahmud", phone: "01812-987654", team: "Tigers XI", total: 800, advance: 400, due: 400, method: "bKash", status: "confirmed", createdAt: "2026-11-05" },
  { id: "KT-20261107-1062", groundId: "ground-b", date: "2026-11-07", hours: [12, 13], name: "Rahim Uddin", phone: "01766-112233", team: "Daulatpur United", total: 2400, advance: 500, due: 1900, method: "Nagad", status: "pending", createdAt: "2026-11-05" },
  { id: "KT-20261107-1063", groundId: "ground-a", date: "2026-11-07", hours: [14], name: "Imran Hossain", phone: "01988-445566", team: "Night Owls FC", total: 1200, advance: 1200, due: 0, method: "bKash", status: "paid", createdAt: "2026-11-06" },
  { id: "KT-20261104-1031", groundId: "ground-b", date: "2026-11-04", hours: [11], name: "Sakib Rahman", phone: "01556-789012", team: "Sonadanga FC", total: 1200, advance: 1200, due: 0, method: "bKash", status: "paid", createdAt: "2026-11-03" },
  { id: "KT-20261104-1032", groundId: "ground-a", date: "2026-11-04", hours: [12], name: "Tanvir Ahmed", phone: "01934-567890", team: "Tigers XI", total: 1200, advance: 600, due: 600, method: "Cash", status: "cancelled", createdAt: "2026-11-03" },
];

export const FACILITIES = [
  { icon: "💡", title: "Floodlight", desc: "রাতেও দিনের মতো আলো" },
  { icon: "🌱", title: "Astroturf", desc: "প্রিমিয়াম কৃত্রিম ঘাস" },
  { icon: "🅿️", title: "Parking", desc: "বাইক ও গাড়ির পার্কিং" },
  { icon: "🚿", title: "Washroom", desc: "পরিষ্কার ওয়াশরুম" },
  { icon: "👕", title: "Changing Room", desc: "জামা বদলের ঘর" },
  { icon: "🏊", title: "Swimming Pool Package", desc: "টার্ফ + সুইমিং পুল প্যাকেজ (কভারে বিজ্ঞাপিত)" },
  { icon: "☕", title: "Cafeteria", desc: "মাঠের পাশেই ক্যাফেটেরিয়া" },
  { icon: "🏟️", title: "Gallery", desc: "দর্শকদের বসার গ্যালারি" },
  { icon: "📹", title: "CCTV Footage", desc: "নিরাপত্তার জন্য পুরো মাঠ সিসিটিভি নজরদারিতে" },
];

export function groundById(id: string): Ground {
  return GROUNDS.find((g) => g.id === id) ?? GROUNDS[0];
}
export function bookedHours(bookings: Booking[], groundId: string, date: string): number[] {
  return bookings
    .filter((b) => b.groundId === groundId && b.date === date && b.status !== "cancelled")
    .flatMap((b) => b.hours);
}

// v5: does this booking belong to this user? Matches by userId when the
// booking has one, otherwise falls back to the booking phone number
// (so v4 seed bookings still belong to the user with that phone).
export function isBookingOwner(
  b: Booking,
  user: { id: string; phone: string } | null
): boolean {
  if (!user) return false;
  if (b.userId) return b.userId === user.id;
  const digits = (p: string) => p.replace(/[-\s]/g, "");
  return digits(b.phone) === digits(user.phone);
}
