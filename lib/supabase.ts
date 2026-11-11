// ─────────────────────────────────────────────────────────────
// Khulna Turf — Supabase client (v3, code only, no credentials).
// The client is created ONLY when BOTH env vars are set:
//   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// With zero env vars (fresh Vercel deploy) getSupabase() returns null
// and the site keeps working in demo mode (localStorage, lib/store.ts).
// TODO (পরে): Supabase project বানিয়ে .env.local / Vercel env vars-এ
// এই দুটো বসালেই lib/db.ts Supabase ব্যবহার শুরু করবে।
// ─────────────────────────────────────────────────────────────
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!isSupabaseConfigured()) {
    client = null;
    return null;
  }
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  return client;
}
