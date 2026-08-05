/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },

  /**
   * Dev-only API proxy: rewrites /api/* on the Next.js dev server to the
   * backend URL, avoiding CORS preflight issues when running locally.
   * In production (Render / Vercel) NEXT_PUBLIC_API_URL points directly
   * to the backend and axios targets it with the correct origin, so these
   * rewrites are a no-op (the condition is never met).
   */
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Only proxy in development; in production the full URL is used.
    if (process.env.NODE_ENV === 'production') return [];

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
