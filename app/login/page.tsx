"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, login, refreshSession } from "../../lib/auth";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/booking";
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshSession();
    if (getCurrentUser()) router.replace(next);
  }, [router, next]);

  const submit = async () => {
    setError("");
    setBusy(true);
    const res = await login(phone, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.replace(next);
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow ring-1 ring-slate-200">
            <Image src="/logo-small.png" alt="Khulna Turf logo" width={512} height={512} sizes="48px" className="h-full w-full object-contain" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-green-950">লগইন করুন</h1>
            <p className="text-sm text-slate-500">বুকিং করতে লগইন করা লাগবে</p>
          </div>
        </div>

        <label className="mt-6 block text-sm font-bold">মোবাইল নম্বর *</label>
        <input
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(""); }}
          placeholder="01XXXXXXXXX"
          inputMode="tel"
          autoComplete="tel"
          className="mt-1 w-full rounded-lg border px-3 py-2.5"
        />
        <label className="mt-4 block text-sm font-bold">পাসওয়ার্ড *</label>
        <input
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
          placeholder="আপনার পাসওয়ার্ড"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border px-3 py-2.5"
        />
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200">
            ⚠️ {error}
          </p>
        )}
        <button
          onClick={() => void submit()}
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-lime-400 py-3 font-bold text-green-950 disabled:opacity-60"
        >
          {busy ? "লগইন হচ্ছে…" : "লগইন করুন"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          অ্যাকাউন্ট নেই?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-green-700 underline">
            রেজিস্টার করুন
          </Link>
        </p>
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/" className="font-bold text-green-700 underline">← হোমে ফিরে যান</Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">লোড হচ্ছে…</div>}>
      <LoginInner />
    </Suspense>
  );
}
