"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addReview, loadReviews, makeReviewId, type Review } from "../lib/reviews";
import { getCurrentUser, type AuthUser } from "../lib/auth";
import Reveal from "./Reveal";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function ReviewCard({ r, className }: { r: Review; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      setTilt({
        x: ((e.clientX - rect.left - centerX) / centerX) * 6,
        y: -((e.clientY - rect.top - centerY) / centerY) * 6,
      });
    },
    [],
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setHovered(false);
      }}
      onMouseEnter={() => setHovered(true)}
      className={`group rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 border border-white/5 cursor-pointer ${className ?? ""}`}
      style={{
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${hovered ? -8 : 0}px) scale(${hovered ? 1.02 : 1})`,
        transition: hovered ? "transform 0.25s ease" : "transform 0.05s linear",
        boxShadow: hovered
          ? "0 28px 56px -14px rgba(4,21,11,0.5), 0 0 0 1px rgba(201,162,39,0.2)"
          : "0 12px 28px -6px rgba(4,21,11,0.35)",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#052e16] ring-2 ring-[#c9a227]/40 text-white font-bold text-sm shadow-lg">
          {initials(r.name) || "?"}
        </span>
        <div>
          <p className="text-sm font-bold text-white leading-tight">{r.name}</p>
          <p className="text-xs text-green-300/80">
            {new Date(r.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-end gap-1 mb-2">
        {[5, 4, 3, 2, 1].map((s) => (
          <span
            key={s}
            className="text-xs font-mono leading-none"
            style={{ color: s <= r.rating ? "#c9a227" : "rgba(255,255,255,0.18)" }}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-green-100/95">{r.text}</p>
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const list = loadReviews();
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setReviews(list);
  }, []);

  const stars = [5, 4, 3, 2, 1];

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!user) return;
    if (!rating) {
      setMessage({ kind: "error", text: "স্টার রেটিং দিন" });
      return;
    }
    if (!text.trim()) {
      setMessage({ kind: "error", text: "রিভিউ লিখুন" });
      return;
    }
    setBusy(true);
    const review: Review = {
      id: makeReviewId(),
      userId: user.id,
      name: user.name,
      rating,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = addReview(review);
    setReviews(next);
    setText("");
    setRating(0);
    setMessage({ kind: "success", text: "রিভিউ পোস্ট করা হয়েছে — ধন্যবাদ!" });
    setBusy(false);
    setTimeout(() => setMessage(null), 4000);
  };

  const empty = reviews.length === 0;

  return (
    <Reveal className="pt-1">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#c9a227]">
          REVIEW BY OUR CUSTOMERS
        </p>
        <h2 className="mt-1 text-center text-3xl font-extrabold tracking-tight text-white">
          খেলোয়াড়রা যা বলেন
        </h2>

        <div className="mt-10 flex justify-center">
          <Reveal className="w-full max-w-2xl">
            <div className="relative overflow-hidden rounded-3xl bg-[#052e16]/70 p-8 md:p-10 ring-1 ring-white/10 border border-[#c9a227]/40 backdrop-blur-sm shadow-2xl">
              {/* soft radial gold glow behind the card */}
              <div className="absolute inset-0 -z-10 blur-[100px] bg-[#c9a227]/20 rounded-2xl" />

              {user ? (
                <form
                  onSubmit={submit}
                  className="relative z-10"
                >
                  <p className="text-center text-sm font-bold text-white">আপনার রিভিউ</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <label className="text-xs font-semibold text-slate-300">রেটিং</label>
                    <div className="flex flex-row-reverse items-center gap-1">
                      {stars.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(rating === s ? 0 : s)}
                          aria-label={`${s} স্টার`}
                          className={`rounded p-1.5 transition text-xl ${rating >= s ? "text-[#c9a227] drop-shadow-[0_0_8px_rgba(201,162,39,.55)]" : "text-slate-500 hover:text-[#c9a227]"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="আপনার অভিজ্ঞতা কী ছিল লিখুন…"
                    rows={4}
                    className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#c9a227] focus:border-transparent resize-none"
                  />
                  {message && message.kind === "error" && (
                    <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 ring-1 ring-red-500/30">
                      ⚠️ {message.text}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy || !rating || !text.trim()}
                    className="mt-4 w-full rounded-xl bg-[#c9a227] px-4 py-3 font-bold text-[#052e16] disabled:opacity-50 disabled:pointer-events-none transition hover:bg-[#bef264]"
                  >
                    {busy ? "পোস্ট হচ্ছে…" : "রিভিউ পোস্ট করুন"}
                  </button>
                </form>
              ) : (
                <div className="relative z-10 text-center">
                  <span aria-hidden="true" className="text-5xl md:text-6xl text-[#c9a227] drop-shadow-lg block mx-auto">
                    “
                  </span>
                  <div className="mt-5 mb-6">
                    {stars.map((s) => (
                      <span
                        key={s}
                        className="text-[#c9a227] text-xl font-mono leading-none"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-white">
                    এখনো কোনো রিভিউ নেই — প্রথম রিভিউটি আপনিই দিন!
                  </p>
                  <p className="mt-3 text-sm text-slate-400">
                    আপনার মতে মাঠটি কেমন লাগলো, আমাদের জানান।
                  </p>
                  <Link
                    href="/login?next=/"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#c9a227] px-5 py-3 font-bold text-[#052e16] transition hover:bg-[#bef264]"
                  >
                    রিভিউ দিতে লগইন করুন →
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {!empty && (
          <div className="mt-12 max-w-6xl mx-auto grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {reviews.map((r) => (
              <ReviewCard key={r.id} r={r} className="max-w-xs w-full" />
            ))}
          </div>
        )}

        {message && message.kind === "success" && (
          <p className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#166534]/60 px-4 py-3 ring-1 ring-[#16a34a]/40 text-sm font-bold text-green-100">
            ✅ {message.text}
          </p>
        )}
      </div>
    </Reveal>
  );
}
