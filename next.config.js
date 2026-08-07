/** @type {import('next').NextConfig} */
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isGitHubPagesBuild ? "/Corporate-Ethics-Tracker" : "",
  assetPrefix: isGitHubPagesBuild ? "/Corporate-Ethics-Tracker/" : undefined,
  trailingSlash: true,
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
