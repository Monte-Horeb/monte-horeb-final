/**
 * Next.js 14 does not support `next.config.ts` (TypeScript config landed in
 * Next 15), so this file must stay .mjs or .js - otherwise every build and
 * dev start fails with "Configuring Next.js via 'next.config.ts' is not
 * supported".
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        // `**` is only valid at the start of a hostname pattern, so the
        // original 'scontent.**.fbcdn.net' was invalid.
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
    ],
  },

  // react-pdf pulls in an optional `canvas` dependency that is Node-only.
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false }
    return config
  },
}

export default nextConfig
