/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    serverActions: { bodySizeLimit: "6mb" },
  },
};
module.exports = nextConfig;
