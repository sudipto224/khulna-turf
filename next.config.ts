import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Real ground photos পরে Supabase Storage-এ আপলোড করলে এই host থেকে
  // ছবি আসবে — তাই remote pattern আগে থেকেই রাখা আছে।
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
