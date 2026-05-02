/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@korero/ui", "@korero/ai", "@korero/data", "@korero/curriculum"],
};

module.exports = nextConfig;
