/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  eslint: {
    // Linting is run separately in CI; do not block local builds on it.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
