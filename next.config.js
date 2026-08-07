/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // This project lives in a OneDrive-synced folder. OneDrive can lock or
    // move files mid-write, which corrupts webpack's on-disk persistent
    // cache in .next/cache and causes intermittent "Cannot find module
    // './NNN.js'" errors. Use the in-memory cache in dev to avoid that.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

module.exports = nextConfig;
