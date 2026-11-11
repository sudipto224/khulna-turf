import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Khulna Turf — খুলনার সেরা ফুটবল ও ক্রিকেট টার্ফ | অনলাইন বুকিং",
    template: "%s | Khulna Turf",
  },
  description:
    "খুলনা টার্ফে অনলাইনে স্লট বুক করুন — ৯০ মিনিটের স্লট, দিনে ১৬টি, Always Open। ঠিকানা: ৪০-৪১, এম এ বারী রোড, গল্লামারী, খুলনা। বুকিং হটলাইন ০১৪০৭-৫০৫৪০৪।",
  keywords: [
    "Khulna Turf",
    "খুলনা টার্ফ",
    "turf booking Khulna",
    "football turf Khulna",
    "cricket turf Khulna",
    "ফুটবল টার্ফ খুলনা",
    "টার্ফ বুকিং",
  ],
  authors: [{ name: "Khulna Turf" }],
  openGraph: {
    type: "website",
    siteName: "Khulna Turf",
    title: "Khulna Turf — ফুটবল ও ক্রিকেট টার্ফ | অনলাইন বুকিং",
    description:
      "৯০ মিনিটের স্লট, দিনে ১৬টি, Always Open। ঠিকানা: ৪০-৪১, এম এ বারী রোড, গল্লামারী, খুলনা। বুকিং হটলাইন ০১৪০৭-৫০৫৪০৪।",
    images: siteUrl ? [{ url: "/logo.png", width: 2048, height: 2048, alt: "Khulna Turf logo" }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "Khulna Turf — ফুটবল ও ক্রিকেট টার্ফ | অনলাইন বুকিং",
    description:
      "৯০ মিনিটের স্লট, দিনে ১৬টি, Always Open। বুকিং হটলাইন ০১৪০৭-৫০৫৪০৪।",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Khulna Turf", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo-small.png", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: ["#052e16"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
