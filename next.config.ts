import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const remoteImagePatterns = [
  {
    protocol: "https",
    hostname: "*.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
] satisfies NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>;

const remoteImageSources = remoteImagePatterns
  .map(({ protocol, hostname }) => `${protocol}://${hostname}`)
  .join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${remoteImageSources}`,
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob: https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.1.90"],
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: remoteImagePatterns,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          ...(!isDevelopment
            ? [
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
