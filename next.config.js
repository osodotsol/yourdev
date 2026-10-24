/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable built-in Image Optimization API to eliminate
  // the GHSA-2464-fhr4-w9xw / CVE-2026-96889 vector while keeping the app non-breaking
  images: {
    unoptimized: true,
  },

  // Apply baseline standard HTTP security headers globally across all routes
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
