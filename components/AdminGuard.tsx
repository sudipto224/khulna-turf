"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { DEMO_ADMIN } from "../lib/data";
import { isAdminLoggedIn, setAdminLoggedIn } from "../lib/store";
import { isSupabaseConfigured } from "../lib/supabase";
import { getCurrentUser, isAdmin, adminLogin, logout, refreshSession, type AuthUser } from "../lib/auth";

const NAV = [
  { href: "/admin", label: "📊 ড্যাশবোর্ড" },
  { href: "/admin/bookings", label: "📋 বুকিংসমূহ" },
  { href: "/admin/calendar", label: "🗓️ ক্যালেন্ডার" },
  { href: "/admin/slots", label: "⏰ স্লট ও দাম" },
  { href: "/admin/customers", label: "👥 কাস্টমার" },
  { href: "/admin/reports", label: "📈 রিপোর্ট" },
  { href: "/admin/settings", label: "⚙️ সেটিংস" },
];

export default function AdminGuard({ children }: { children: ReactNode }) {
  const supabaseMode = isSupabaseConfigured();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [pass, setPass] = useState(DEMO_ADMIN.password);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (supabaseMode) {
      let alive = true;
      void refreshSession().then((u) => {
        if (!alive) return;
        setUser(u ?? getCurrentUser());
        setAuthed(Boolean(u && isAdmin()));
      });
      return () => { alive = false; };
    }
    setAuthed(isAdminLoggedIn());
  }, [supabaseMode]);

  // Demo-mode login (hardcoded credentials, only when Supabase is NOT configured).
  const handleDemoSubmit = () => {
    setErr("");
    if (email.trim() === DEMO_ADMIN.email && pass === DEMO_ADMIN.password) {
      setAdminLoggedIn(true);
      setAuthed(true);
    } else {
      setErr("ভুল ইমেইল বা পাসওয়ার্ড।");
    }
  };

  // Supabase-mode login (email + password via Supabase Auth).
  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await adminLogin(email.trim(), pass);
      setBusy(false);
      if (!res.ok) {
        setErr(res.error || "লগইন করতে সমস্যা হচ্ছে।");
        return;
      }
      setUser(res.user);
      setAuthed(Boolean(res.user && isAdmin()));
      if (!res.user || !isAdmin()) {
        // Not an admin — log out so a customer cannot stay on /admin.
        await logout();
        setErr("শুধু অ্যাডমিন অ্যাকাউন্টে ড্যাশবোর্ডে ঢুকতে পারবেন।");
        setAuthed(false);
      }
    } catch {
      setBusy(false);
      setErr("লগইন করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
    }
  };

  const handleLogout = async () => {
    await logout();
    setAdminLoggedIn(false);
    setUser(null);
    setAuthed(false);
    router.push("/");
  };

  if (authed === null) {
    return <div className="p-10 text-center text-slate-500">লোড হচ্ছে…</div>;
  }

  // ───────────────────────── Demo mode ─────────────────────────
  if (!supabaseMode) {
    if (!authed) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-green-950 px-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-pop"
            onSubmit={(e) => { e.preventDefault(); handleDemoSubmit(); }}
          >
            <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow ring-1 ring-slate-100">
              <Image src="/logo-small.png" alt="Khulna Turf logo" width={512} height={512} sizes="80px" className="h-full w-full object-contain" />
            </span>
            <h1 className="mt-2 text-center text-2xl font-extrabold text-green-950">Khulna Turf — মালিক লগইন</h1>
            <p className="mt-1 text-center text-sm text-slate-500">অ্যাডমিন ড্যাশবোর্ডে ঢুকতে লগইন করুন</p>
            <label className="mt-6 block text-sm font-semibold">ইমেইল</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5" />
            <label className="mt-4 block text-sm font-semibold">পাসওয়ার্ড</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5" />
            {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
            <button disabled={busy} className="mt-6 w-full rounded-lg bg-lime-400 py-3 font-bold text-green-950 hover:bg-lime-300 disabled:opacity-60">
              লগইন করুন
            </button>
            <Link href="/" className="mt-4 block text-center text-sm text-green-700 underline">← কাস্টমার ওয়েবসাইটে ফিরুন</Link>
          </form>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen bg-slate-100">
        <aside className="hidden w-64 shrink-0 bg-[#04150b] p-4 text-white md:block">
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow">
              <Image src="/logo-small.png" alt="Khulna Turf logo" width={512} height={512} sizes="44px" className="h-full w-full object-contain" />
            </span>
            <span>
              <span className="block text-lg font-extrabold leading-tight">Khulna Turf</span>
              <span className="block text-[10px] font-semibold tracking-wider text-lime-300">মালিক ড্যাশবোর্ড</span>
            </span>
          </div>
          <nav className="mt-6 space-y-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`block rounded-lg px-3 py-2.5 text-sm ${path === n.href ? "bg-lime-400 font-bold text-green-950" : "hover:bg-green-800"}`}>{n.label}</Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="mt-8 w-full rounded-lg bg-green-800 py-2 text-sm">লগআউট</button>
          <Link href="/" className="mt-2 block text-center text-xs text-green-300 underline">কাস্টমার সাইট দেখুন →</Link>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex gap-2 overflow-x-auto bg-white px-4 py-3 shadow-sm md:hidden">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${path === n.href ? "bg-lime-400 text-green-950" : "bg-slate-100"}`}>{n.label}</Link>
            ))}
          </div>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    );
  }

  // ───────────────────────── Supabase mode ─────────────────────
  if (!authed || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-950 px-4">
        <form
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-pop"
          onSubmit={handleSupabaseSubmit}
        >
          <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow ring-1 ring-slate-100">
            <Image src="/logo-small.png" alt="Khulna Turf logo" width={512} height={512} sizes="80px" className="h-full w-full object-contain" />
          </span>
          <h1 className="mt-2 text-center text-2xl font-extrabold text-green-950">Khulna Turf — মালিক লগইন</h1>
          <p className="mt-1 text-center text-sm text-slate-500">অ্যাডমিন ড্যাশবোর্ডে ঢুকতে লগইন করুন</p>
          <label className="mt-6 block text-sm font-semibold">ইমেইল</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5" />
          <label className="mt-4 block text-sm font-semibold">পাসওয়ার্ড</label>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5" />
          {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
          <button disabled={busy} className="mt-6 w-full rounded-lg bg-lime-400 py-3 font-bold text-green-950 hover:bg-lime-300 disabled:opacity-60">
            লগইন করুন
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-green-700 underline">← কাস্টমার ওয়েবসাইটে ফিরুন</Link>
        </form>
      </div>
    );
  }

  // Logged in but not admin → blocked message.
  if (!isAdmin()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-red-100 p-2">
            <span className="text-4xl">🔐</span>
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-green-950">অ্যাডমিন অ্যাক্সেস প্রয়োজন</h1>
          <p className="mt-4 text-slate-600">
            আপনার অ্যাকাউন্টে অ্যাডমিন অধিকার নেই। ড্যাশবোর্ডে ঢুকতে অ্যাডমিন হিসাবে লগইন করুন।
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={handleLogout} className="rounded-lg bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200">লগআউট</button>
            <Link href="/" className="rounded-lg bg-lime-400 px-4 py-2 font-bold text-green-950 hover:bg-lime-300">কাস্টমার সাইটে ফিরুন</Link>
          </div>
        </div>
      </div>
    );
  }

  // Authed admin → show dashboard layout.
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 bg-[#04150b] p-4 text-white md:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow">
            <Image src="/logo-small.png" alt="Khulna Turf logo" width={512} height={512} sizes="44px" className="h-full w-full object-contain" />
          </span>
          <span>
            <span className="block text-lg font-extrabold leading-tight">Khulna Turf</span>
            <span className="block text-[10px] font-semibold tracking-wider text-lime-300">মালিক ড্যাশবোর্ড</span>
          </span>
        </div>
        <nav className="mt-6 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`block rounded-lg px-3 py-2.5 text-sm ${path === n.href ? "bg-lime-400 font-bold text-green-950" : "hover:bg-green-800"}`}>{n.label}</Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-8 w-full rounded-lg bg-green-800 py-2 text-sm">লগআউট</button>
        <Link href="/" className="mt-2 block text-center text-xs text-green-300 underline">কাস্টমার সাইট দেখুন →</Link>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex gap-2 overflow-x-auto bg-white px-4 py-3 shadow-sm md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${path === n.href ? "bg-lime-400 text-green-950" : "bg-slate-100"}`}>{n.label}</Link>
          ))}
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
