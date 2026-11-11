import type { MetadataRoute } from "next";

// সাইটের আসল ঠিকানা: Vercel-এ NEXT_PUBLIC_SITE_URL বসালে সেটাই,
// না বসালে নিচের placeholder — deploy-এর পর আসল ডোমেইনে বদলে নেবে।
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://khulna-turf.vercel.app";

const ROUTES = [
  "/",
  "/grounds",
  "/grounds/ground-a",
  "/booking",
  "/login",
  "/register",
  "/pricing",
  "/info",
  "/my-bookings",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" || path === "/booking" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/booking" ? 0.9 : 0.7,
  }));
}
