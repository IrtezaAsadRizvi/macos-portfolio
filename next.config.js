/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
});

module.exports = nextConfig;
