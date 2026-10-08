/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: "standalone",
  // Django API requires trailing slashes; preserve POST bodies and avoid redirect loops.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const backend = process.env.PAL_BACKEND_URL ?? (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8081" : "")
    return backend ? [{ source: "/api/:path*", destination: `${backend.replace(/\/$/, "")}/api/:path*/` }] : []
  },
  // Show-only store (SHOP_SALES_ENABLED=false in lib/shop.ts): no cart or orders.
  async redirects() {
    return ["/cart", "/orders", "/orders/:path*"].map((source) => ({ source, destination: "/catalog", permanent: false }))
  },
  async headers() {
    return [
      { source: "/submit/status/:token", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/dashboard", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      ...["/pal-coffee.mp4", "/video/pal/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      })),
      { source: "/video/pal/:segment*.m2t", headers: [{ key: "Content-Type", value: "video/mp2t" }] },
    ]
  },
  images: {
    qualities: [70, 80, 100],
    imageSizes: [350, 450, 700],
    deviceSizes: [1080, 350, 100 ],
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8081", pathname: "/media/**" },
      { protocol: "http", hostname: "localhost", port: "8081", pathname: "/media/**" },
      {
        protocol: "https",
        hostname: "palcoffee.ir",
      },
    ],
  },
}

export default nextConfig
