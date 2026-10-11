import type { NextConfig } from "next";

/**
 * Security and SEO headers that signal trust to crawlers and improve Core Web
 * Vitals. Google uses page experience signals (HTTPS, safe-browsing, no
 * intrusive interstitials) as ranking factors, and these headers contribute
 * to that signal.
 */
const securityHeaders = [
  // DNS prefetch speeds up external resource loading (fonts, analytics)
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Prevent MIME-type sniffing (security + SEO trust signal)
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
  // Enforce HTTPS for one year (includes subdomains)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js header — it exposes the framework and
  // adds no SEO value. Leaner response headers marginally improve TTFB.
  poweredByHeader: false,
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
    ];
  },
};

export default nextConfig;
