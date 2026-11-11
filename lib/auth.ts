// ─────────────────────────────────────────────────────────────
// Khulna Turf — user auth (v5).
//
// TWO MODES, same function signatures:
//   • Demo mode (zero env vars): users live in localStorage
//     (khulna-turf-users-v1), session in khulna-turf-session-v1.
//     Passwords are NEVER stored in plain text — they are stored as
//     salt + SHA-256 hash (Web Crypto). Demo-only, for the client demo.
//   • Supabase mode (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY set):
//     uses Supabase Auth (signUp / signInWithPassword / signOut).
//     Supabase Auth needs an email, so the phone number is mapped to a
//     synthetic email "<phone>@khulna-turf.local" — the phone stays the
//     user's real login identity on the site. Name is kept in
//     user_metadata. No real secrets are stored anywhere in this file.
//
// TODO (production): Supabase Dashboard → Authentication → Providers →
//   Email → "Confirm email" বন্ধ রাখুন (না হলে signUp-এর পর লগইন
//   আটকে যাবে), অথবা ইমেইল কনফার্মেশন চালু করে আসল ইমেইল দিয়ে
//   রেজিস্টার করার ফ্লো বানান। SMS OTP পরে যোগ করা যাবে (Twilio /
//   SSLCommerz SMS)। Demo অ্যাকাউন্ট প্রোডাকশনে যাওয়ার আগে মুছে ফেলুন
//   (README.md দেখুন)।
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";

export type AuthUser = { id: string; name: string; phone: string; isAdmin?: boolean };

type StoredUser = {
  id: string;
  name: string;
  phone: string; // 11 digits, e.g. 01700000000
  salt: string;
  hash: string; // SHA-256 hex of `${salt}:${password}`
};

const USERS_KEY = "khulna-turf-users-v1";
const SESSION_KEY = "khulna-turf-session-v1";

export const BD_PHONE_RE = /^01[3-9]\d{8}$/;

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function normalizePhone(p: string): string {
  return p.replace(/[-\s]/g, "");
}

function notifyAuthChanged(): void {
  if (isBrowser()) window.dispatchEvent(new Event("khulna-turf-auth"));
}

// ── Password hashing (Web Crypto SHA-256, salted) ───────────────
async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback only for non-secure contexts (crypto.subtle unavailable):
  // still never plain text, but NOT production-grade — see TODO above.
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const s = `${salt}:${password}`;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

function randomSalt(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return `salt-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

// ── Demo-mode storage ───────────────────────────────────────────
function loadUsers(): StoredUser[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const list = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    return list;
  } catch {
    return [];
  }
}

function saveUsers(list: StoredUser[]): void {
  if (isBrowser()) localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function saveSession(user: AuthUser): void {
  if (isBrowser()) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function loadSession(): AuthUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function syntheticEmail(phone: string): string {
  return `${normalizePhone(phone)}@khulna-turf.local`;
}

// ── Public API (same signatures in both modes) ──────────────────
/** Sync: returns the logged-in user, or null. */
export function getCurrentUser(): AuthUser | null {
  return loadSession();
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/** True when the logged-in user's Supabase user_metadata.is_admin is true.
 *  Demo mode: false (demo admin is handled by the AdminGuard localStorage flag). */
export function isAdmin(): boolean {
  const u = getCurrentUser();
  return Boolean(u?.isAdmin);
}

/**
 * Supabase mode: refresh the cached session from Supabase Auth.
 * Call once on page load (useEffect). In demo mode this is a no-op.
 */
export async function refreshSession(): Promise<AuthUser | null> {
  const sb = getSupabase();
  if (!sb) return loadSession();
  try {
    const { data } = await sb.auth.getSession();
    const sbUser = data.session?.user;
    if (!sbUser) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    const meta = (sbUser.user_metadata ?? {}) as Record<string, unknown>;
    const phone = String(meta.phone ?? sbUser.email ?? "").replace("@khulna-turf.local", "");
    const user: AuthUser = {
      id: sbUser.id,
      name: String(meta.name ?? "Player"),
      phone,
      isAdmin: meta.is_admin === true,
    };
    saveSession(user);
    return user;
  } catch {
    return loadSession();
  }
}

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

export async function register(
  name: string,
  phoneRaw: string,
  password: string
): Promise<AuthResult> {
  const phone = normalizePhone(phoneRaw);
  if (!name.trim()) return { ok: false, error: "আপনার নাম দিন" };
  if (!BD_PHONE_RE.test(phone))
    return { ok: false, error: "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01 দিয়ে শুরু)" };
  if (password.length < 6) return { ok: false, error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" };

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email: syntheticEmail(phone),
      password,
      options: { data: { name: name.trim(), phone } },
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message))
        return { ok: false, error: "এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে — লগইন করুন।" };
      return { ok: false, error: "রেজিস্টার করা যায়নি — আবার চেষ্টা করুন।" };
    }
    // If email confirmation is on, signUp returns a user but no session.
    let sessionUser = data.user;
    if (!data.session && sessionUser) {
      const again = await sb.auth.signInWithPassword({
        email: syntheticEmail(phone),
        password,
      });
      if (again.data.user) sessionUser = again.data.user;
      else
        return {
          ok: false,
          error: "অ্যাকাউন্ট তৈরি হয়েছে — ইমেইল কনফার্মেশন চালু থাকলে Supabase Dashboard থেকে সেটি বন্ধ করুন, তারপর লগইন করুন।",
        };
    }
    if (!sessionUser) return { ok: false, error: "রেজিস্টার করা যায়নি — আবার চেষ্টা করুন।" };
    const user: AuthUser = { id: sessionUser.id, name: name.trim(), phone };
    saveSession(user);
    notifyAuthChanged();
    return { ok: true, user };
  }

  // Demo mode (localStorage)
  const users = loadUsers();
  if (users.some((u) => u.phone === phone))
    return { ok: false, error: "এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে — লগইন করুন।" };
  const salt = randomSalt();
  const user: StoredUser = {
    id: phone,
    name: name.trim(),
    phone,
    salt,
    hash: await hashPassword(password, salt),
  };
  users.push(user);
  saveUsers(users);
  const authUser: AuthUser = { id: user.id, name: user.name, phone: user.phone };
  saveSession(authUser);
  notifyAuthChanged();
  return { ok: true, user: authUser };
}

export async function login(phoneRaw: string, password: string): Promise<AuthResult> {
  const phone = normalizePhone(phoneRaw);
  if (!BD_PHONE_RE.test(phone))
    return { ok: false, error: "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01 দিয়ে শুরু)" };
  if (!password) return { ok: false, error: "পাসওয়ার্ড দিন" };

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({
      email: syntheticEmail(phone),
      password,
    });
    if (error || !data.user)
      return { ok: false, error: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।" };
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const user: AuthUser = {
      id: data.user.id,
      name: String(meta.name ?? "Player"),
      phone,
    };
    saveSession(user);
    notifyAuthChanged();
    return { ok: true, user };
  }

  // Demo mode (localStorage) — compare salted hashes, never plain text.
  const users = loadUsers();
  const found = users.find((u) => u.phone === phone);
  if (!found) return { ok: false, error: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।" };
  const hash = await hashPassword(password, found.salt);
  if (hash !== found.hash)
    return { ok: false, error: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।" };
  const user: AuthUser = { id: found.id, name: found.name, phone: found.phone };
  saveSession(user);
  notifyAuthChanged();
  return { ok: true, user };
}

/** Admin login with a real email (no phone validation, no synthetic-email mapping).
 *  Supabase mode only — signInWithPassword directly with the email, then refresh
 *  the session so isAdmin is populated from user_metadata.is_admin.
 *  In demo mode this is not used (AdminGuard keeps the hardcoded demo login path). */
export async function adminLogin(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!email.trim()) return { ok: false, error: "ইমেইল দিন" };
  if (!password) return { ok: false, error: "পাসওয়ার্ড দিন" };

  const sb = getSupabase();
  if (!sb) return { ok: false, error: "অ্যাডমিন লগইন করতে সমস্যা হচ্ছে।" };
  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.user)
      return { ok: false, error: "ভুল ইমেইল বা পাসওয়ার্ড।" };
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const user: AuthUser = {
      id: data.user.id,
      name: String(meta.name ?? "Player"),
      phone: String(meta.phone ?? data.user.email ?? ""),
      isAdmin: meta.is_admin === true,
    };
    saveSession(user);
    notifyAuthChanged();
    return { ok: true, user };
  } catch {
    return { ok: false, error: "ভুল ইমেইল বা পাসওয়ার্ড।" };
  }
}

export async function logout(): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch {
      // fall through — local session is cleared below either way
    }
  }
  if (isBrowser()) localStorage.removeItem(SESSION_KEY);
  notifyAuthChanged();
}

/**
 * React hook: current user, kept in sync across pages/tabs.
 * Call refreshSession() on mount in pages that need fresh Supabase state.
 */
export function useAuthUser(): {
  user: AuthUser | null;
  refresh: () => Promise<AuthUser | null>;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    sync();
    window.addEventListener("khulna-turf-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("khulna-turf-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const refresh = async () => {
    const u = await refreshSession();
    setUser(u);
    return u;
  };
  return { user, refresh };
}
