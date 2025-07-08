/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['postgres'],
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'utils'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    CUSTOM_KEY: 'feedbackme-waitlist',
  },
}

module.exports = nextConfig 