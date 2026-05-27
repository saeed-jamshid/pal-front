/** @type {import('next').NextConfig} */
const nextConfig = {
  //cacheComponents: true,
  images: {
    qualities: [70, 80, 100],
    imageSizes: [350, 450, 700],
    deviceSizes: [1080, 350, 100 ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "palcoffee.ir",
      },
    ],
  },
  typescript: {
    //TODO
    ignoreBuildErrors: true,
  },
}

export default nextConfig
