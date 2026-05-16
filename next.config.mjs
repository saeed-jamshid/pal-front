/** @type {import('next').NextConfig} */
const nextConfig = {
  //cacheComponents: true,
  images: {
    qualities: [70, 80, 100],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
