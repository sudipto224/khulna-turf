// ─────────────────────────────────────────────────────────────
// Khulna Turf — data adapter (v3).
// Supabase configured থাকলে বুকিং Supabase-এ যাবে, না থাকলে আগের মতো
// localStorage-এ (lib/store.ts) — তাই Vercel-এ zero env var-এও সাইট চলে।
// TODO (পরে): Supabase চালু করার পর admin পেজগুলোও এই adapter-এর
// loadBookingsAsync() ব্যবহার করবে; এখন admin পেজ localStorage দিয়েই
// চলে (দুটো মোডেই কাজ করে)।
// ─────────────────────────────────────────────────────────────
import { bookedHours, PRICING, TURF, type Booking } from "./data";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { addBooking, loadBookings, updateBooking, loadBlocked, saveBlocked, blockedKey } from "./store";

export function isDbConfigured(): boolean {
  return isSupabaseConfigured();
}

// Supabase row -> Booking (columns match supabase/schema.sql)
function rowToBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id),
    groundId: String(row.ground_id),
    date: String(row.date),
    hours: (row.slot_indices as number[]) ?? [],
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    team: String(row.team ?? "—"),
    total: Number(row.total ?? 0),
    advance: Number(row.advance ?? 0),
    due: Number(row.due ?? 0),
    method: String(row.advance_method ?? ""),
    status: (row.status as Booking["status"]) ?? "pending",
    createdAt: String(row.created_at ?? "").slice(0, 10),
    userId: row.user_id ? String(row.user_id) : undefined,
  };
}

function bookingToRow(b: Booking): Record<string, unknown> {
  return {
    id: b.id,
    ground_id: b.groundId,
    date: b.date,
    slot_indices: b.hours,
    name: b.name,
    phone: b.phone,
    team: b.team,
    total: b.total,
    advance: b.advance,
    due: b.due,
    advance_method: b.method,
    status: b.status,
    user_id: b.userId ?? b.phone.replace(/[-\s]/g, ""),
  };
}

/** Create a booking: Supabase (if configured) else localStorage. */
export async function createBooking(b: Booking): Promise<{ mode: "supabase" | "local" }> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("bookings").insert(bookingToRow(b));
    if (error) {
      // Supabase-এ লেখা না গেলে demo mode-এ ফিরে যাও — বুকিং হারাবে না।
      console.warn("[db] Supabase insert failed, falling back to localStorage:", error.message);
      addBooking(b);
      return { mode: "local" };
    }
    return { mode: "supabase" };
  }
  addBooking(b);
  return { mode: "local" };
}

/** Update a booking's status (admin actions). */
export async function updateBookingStatus(
  id: string,
  patch: Partial<Booking>
): Promise<Booking[]> {
  const sb = getSupabase();
  if (sb) {
    const row: Record<string, unknown> = {};
    if (patch.status) row.status = patch.status;
    if (patch.advance !== undefined) row.advance = patch.advance;
    if (patch.due !== undefined) row.due = patch.due;
    const { error } = await sb.from("bookings").update(row).eq("id", id);
    if (!error) return loadBookingsAsync();
    console.warn("[db] Supabase update failed, falling back to localStorage:", error.message);
  }
  return updateBooking(id, patch);
}

/** Load all bookings: Supabase (if configured) else localStorage seed/demo. */
export async function loadBookingsAsync(): Promise<Booking[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: sessionData } = await sb.auth.getSession();
    const sess = sessionData.session;
    console.log("[db] loadBookingsAsync:", {
      queryResult: { rowCount: data?.length, error },
      sessionUser: sess?.user?.email,
      user_metadata: sess?.user?.user_metadata,
      is_admin: sess?.user?.user_metadata?.is_admin,
    });
    if (!error && data) return (data as Record<string, unknown>[]).map(rowToBooking);
    console.warn("[db] Supabase read failed, falling back to localStorage:", error?.message);
  }
  return loadBookings();
}

/** Get booked slot indices for a ground + date.
 *  Supabase mode: calls the get_booked_slots RPC (returns all users' booked slots under RLS-bypass SECURITY DEFINER).
 *  Local mode: falls back to bookedHours() + loadBookings() from localStorage.
 */
export async function getBookedSlots(groundId: string, date: string): Promise<number[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.rpc("get_booked_slots", { p_ground: groundId, p_date: date });
      if (!error && data) {
        const slots: number[] = Array.isArray(data)
          ? data.map((d: any) => (typeof d === "number" ? d : (d as any)?.slot_index ?? d)).filter((n: any) => typeof n === "number" && !Number.isNaN(n))
          : [];
        if (slots.length > 0) return slots;
      }
    } catch {
      // fall through to local fallback
    }
  }
  const bookings = loadBookings();
  return bookedHours(bookings, groundId, date);
}

/** Get blocked slot indices for a ground + date.
 *  Supabase mode: SELECT slot_index from public.blocked_slots where
 *  ground_id = groundId and date = date (public SELECT policy allows guests).
 *  Demo mode (or on Supabase error): falls back to loadBlocked() from
 *  localStorage, filtered for this ground + date. Key shape unchanged:
 *  `${groundId}|${date}|${slot_index}`.
 */
export async function getBlockedSlots(groundId: string, date: string): Promise<number[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("blocked_slots")
        .select("slot_index")
        .eq("ground_id", groundId)
        .eq("date", date);
      if (!error && data) {
        return (data as { slot_index: number }[])
          .map((d) => Number(d.slot_index))
          .filter((n) => typeof n === "number" && !Number.isNaN(n));
      }
      console.warn("[db] getBlockedSlots Supabase read failed, falling back to localStorage:", error?.message);
    } catch {
      // fall through to local fallback
    }
  }
  const blocked = loadBlocked();
  return Object.keys(blocked)
    .filter((k) => k.startsWith(`${groundId}|${date}|`))
    .map((k) => Number(k.split("|")[2]))
    .filter((n) => typeof n === "number" && !Number.isNaN(n));
}

/** Block or unblock a single slot for a ground + date.
 *  Supabase mode: block → INSERT (ground_id, date, slot_index, reason
 *  default 'Maintenance') ON CONFLICT DO NOTHING; unblock → DELETE the
 *  matching row. Admin ALL policy on blocked_slots covers this.
 *  Demo mode: uses saveBlocked() with the same
 *  `${groundId}|${date}|${slot_index}` local key shape as today.
 */
export async function setBlockedSlot(
  groundId: string,
  date: string,
  slotIndex: number,
  blocked: boolean,
  reason = "Maintenance",
): Promise<void> {
  const sb = getSupabase();
  const k = blockedKey(groundId, date, slotIndex);
  if (sb) {
    try {
      if (blocked) {
        const { error } = await sb
          .from("blocked_slots")
          .upsert({ ground_id: groundId, date, slot_index: slotIndex, reason }, { onConflict: "ground_id, date, slot_index", ignoreDuplicates: true });
        if (!error) return;
        console.warn("[db] setBlockedSlot upsert failed:", error.message);
      } else {
        const { error } = await sb
          .from("blocked_slots")
          .delete()
          .eq("ground_id", groundId)
          .eq("date", date)
          .eq("slot_index", slotIndex);
        if (!error) return;
        console.warn("[db] setBlockedSlot delete failed:", error.message);
      }
    } catch {
      // fall through to local fallback
    }
  }
  const next = { ...loadBlocked() };
  if (blocked) next[k] = reason;
  else delete next[k];
  saveBlocked(next);
}

// ── Settings (single row id = 1) ───────────────────────────────

export type Settings = {
  turfName: string;
  address: string;
  phone: string;
  peak: number;
  offPeak: number;
};

const settingsFromRow = (row: Record<string, unknown>): Settings => ({
  turfName: String(row.turf_name ?? TURF.name),
  address: String(row.address ?? TURF.address),
  phone: String(row.phone ?? TURF.phone),
  peak: Number(row.peak_per_slot ?? PRICING.peakPerSlot),
  offPeak: Number(row.off_peak_per_slot ?? PRICING.offPeakPerSlot),
});

const settingsFromData = (): Settings => ({
  turfName: TURF.name,
  address: TURF.address,
  phone: TURF.phone,
  peak: PRICING.peakPerSlot,
  offPeak: PRICING.offPeakPerSlot,
});

/** Load settings: Supabase mode reads the single row id = 1 from public.settings;
 *  demo mode falls back to lib/data.ts values. On any Supabase error, falls back too. */
export async function getSettings(): Promise<Settings> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("settings").select("*").eq("id", 1).single();
      if (!error && data) return settingsFromRow(data);
      console.warn("[db] getSettings Supabase read failed, falling back to lib/data.ts:", error?.message);
    } catch (err) {
      console.warn("[db] getSettings Supabase read threw, falling back to lib/data.ts:", err);
    }
  }
  return settingsFromData();
}

/** Update settings row id = 1 (admin only).
 *  Supabase mode: UPDATE public.settings set ... where id = 1, updated_at = now().
 *  Demo mode: does NOT write anywhere — returns an error in Bangla. */
export async function updateSettings(
  patch: Partial<Omit<Settings, "turfName">>
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "সেভ করতে Supabase নেই — ডেমো মোডে সেটিংস বদলানো যায় না।" };
  try {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.address !== undefined) row.address = patch.address;
    if (patch.phone !== undefined) row.phone = patch.phone;
    if (patch.peak !== undefined) row.peak_per_slot = patch.peak;
    if (patch.offPeak !== undefined) row.off_peak_per_slot = patch.offPeak;
    const { error } = await sb.from("settings").update(row).eq("id", 1);
    if (error) return { ok: false, error: "সেটিংস সেভ করা যায়নি — আবার চেষ্টা করুন।" };
    return { ok: true };
  } catch {
    return { ok: false, error: "সেটিংস সেভ করা যায়নি — আবার চেষ্টা করুন।" };
  }
}
