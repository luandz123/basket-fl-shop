/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'example.com'],
  },
  experimental: {
    serverActions: { allowed: true }
  }
};

module.exports = nextConfig;
