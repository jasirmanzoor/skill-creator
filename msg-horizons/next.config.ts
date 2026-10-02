import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Once NEXT_PUBLIC_SITE_URL points at MSG's own domain, the vercel.app address sends everyone there.
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const VERCEL_HOST = "msg-horizons.vercel.app";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    if (!SITE || new URL(SITE).host === VERCEL_HOST) return [];
    return [{ source: "/:path*", has: [{ type: "host", value: VERCEL_HOST }], destination: `${SITE}/:path*`, permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
