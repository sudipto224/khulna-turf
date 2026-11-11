// localStorage persistence for demo v1 — no backend needed.
// TODO (production): replace all helpers here with Supabase / Laravel API calls.
// The page components only call these helpers, so swapping the backend is one file.

import { Booking, SEED_BOOKINGS, TURF, PRICING } from "./data";

const BOOKINGS_KEY = "khulna-turf-bookings-v1";
const BLOCKED_KEY = "khulna-turf-blocked-v1";
const SETTINGS_KEY = "khulna-turf-settings-v1";
const ADMIN_KEY = "khulna-turf-admin-v1";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadBookings(): Booking[] {
  if (!isBrowser()) return SEED_BOOKINGS;
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS));
      return SEED_BOOKINGS;
    }
    return JSON.parse(raw) as Booking[];
  } catch {
    return SEED_BOOKINGS;
  }
}

export function saveBookings(list: Booking[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}

export function addBooking(b: Booking): void {
  saveBookings([b, ...loadBookings()]);
}

export function updateBooking(id: string, patch: Partial<Booking>): Booking[] {
  const next = loadBookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
  saveBookings(next);
  return next;
}

// Blocked slots: { "ground-a|2026-11-06|16": "Maintenance" }
export type BlockedMap = Record<string, string>;
export function loadBlocked(): BlockedMap {
  if (!isBrowser()) return {};
  try { return JSON.parse(localStorage.getItem(BLOCKED_KEY) || "{}"); } catch { return {}; }
}
export function saveBlocked(m: BlockedMap): void {
  if (isBrowser()) localStorage.setItem(BLOCKED_KEY, JSON.stringify(m));
}
export function blockedKey(groundId: string, date: string, hour: number): string {
  return `${groundId}|${date}|${hour}`;
}

// Settings overrides (editable in /admin/settings)
export type Settings = { turfName: string; address: string; phone: string; peak: number; offPeak: number };
export function loadSettings(): Settings {
  const fallback: Settings = { turfName: TURF.name, address: TURF.address, phone: TURF.phone, peak: PRICING.peakPerSlot, offPeak: PRICING.offPeakPerSlot };
  if (!isBrowser()) return fallback;
  try { return { ...fallback, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") as Partial<Settings>) }; } catch { return fallback; }
}
export function saveSettings(s: Settings): void {
  if (isBrowser()) localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function isAdminLoggedIn(): boolean {
  return isBrowser() && localStorage.getItem(ADMIN_KEY) === "1";
}
export function setAdminLoggedIn(v: boolean): void {
  if (!isBrowser()) return;
  if (v) localStorage.setItem(ADMIN_KEY, "1");
  else localStorage.removeItem(ADMIN_KEY);
}

export function makeBookingId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `KT-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}
