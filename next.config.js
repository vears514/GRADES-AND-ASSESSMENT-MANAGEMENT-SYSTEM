/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Run a dedicated tsc step via npm scripts and skip Next's worker-based type check.
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },
}

module.exports = nextConfig
