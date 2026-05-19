/** @type {import('next').NextConfig} */
const nextConfig = {
  //cacheComponents: true,
  images: {
    qualities: [70, 80, 100],
    imageSizes: [350,450,700],
    deviceSizes: [350,100],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
