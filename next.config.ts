import type { NextConfig } from "next";

// Security + SEO headers applied to all responses
const securityHeaders = [
  // DNS prefetch speeds up external resource loading (fonts, analytics)
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent click-jacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Legacy XSS protection for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Control referrer data sent with navigation — balance SEO attribution
  // with privacy by sending the origin on cross-origin, full URL same-origin
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser features the app doesn't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enforce HTTPS for one year (includes subdomains) — boosts SEO trust
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js header — it exposes the framework and
  // adds no SEO value. Leaner response headers marginally improve TTFB.
  poweredByHeader: false,
  // Compress responses for faster page loads (better Core Web Vitals)
  compress: true,
  serverExternalPackages: [
    'pdf2json',
    'mammoth',
  ],
  allowedDevOrigins: ['[::1]'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        // Also covers exported PDF responses without changing their content
        // or Content-Disposition. robots.txt separately limits API crawling.
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, nosnippet' }],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect common misspellings/variations to canonical URLs
      {
        source: '/plagiarism-checker',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ai-detector',
        destination: '/',
        permanent: true,
      },
      {
        source: '/check-plagiarism',
        destination: '/',
        permanent: true,
      },
      {
        source: '/free-plagiarism-checker',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
