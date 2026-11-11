// localStorage-backed reviews — demo v1.
// TODO (production): swap these helpers for Supabase / Laravel API calls.
export type Review = {
  id: string;
  userId: string;
  name: string;
  rating: number; // 1–5
  text: string;
  createdAt: string; // ISO string
};

const REVIEWS_KEY = "khulna-turf-reviews-v1";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadReviews(): Review[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Review[];
  } catch {
    return [];
  }
}

export function saveReviews(list: Review[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
}

export function addReview(review: Review): Review[] {
  const next = [review, ...loadReviews()];
  saveReviews(next);
  return next;
}

export function makeReviewId(): string {
  return `RW-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
