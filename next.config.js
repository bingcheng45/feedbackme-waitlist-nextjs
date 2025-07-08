/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['postgres'],
  },
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
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    CUSTOM_KEY: 'feedbackme-waitlist',
  },
}

module.exports = nextConfig 