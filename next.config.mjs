/** @type {import('next').NextConfig} */
const nextConfig = {
  //cacheComponents: true,
  images: {
    qualities: [70, 80, 100],
    disableStaticImages: true,
  },
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
