"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Reveal-on-scroll via IntersectionObserver — no animation library.
export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // v4 safety net: if the observer never fires (slow JS, odd viewport),
    // the section must still appear — never leave a blank white gap.
    const fallback = setTimeout(() => el.classList.add("visible"), 900);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } }),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => { clearTimeout(fallback); obs.disconnect(); };
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
