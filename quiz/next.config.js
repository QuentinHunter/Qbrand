/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['quentinhunter.com', 'images.leadconnectorhq.com']
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html'
      },
      {
        source: '/pages/:path*',
        destination: '/pages/:path*'
      }
    ]
  }
}

module.exports = nextConfig
