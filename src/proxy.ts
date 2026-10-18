// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity — Security Proxy (Next.js 16+ convention)
// CORS, CSRF, Security Headers, CSP for Google Analytics & AdSense
// ═══════════════════════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from 'next/server';

// Maximum request body size: 16MB (supports 15MB file uploads)
const MAX_BODY_BYTES = 16 * 1024 * 1024;

// Security headers applied to all responses
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-DNS-Prefetch-Control': 'on',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for PDF export — Content-Disposition must not be interfered with
  if (pathname === '/api/export-pdf') {
    return NextResponse.next();
  }

  // ── API Route Protection ────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // CSRF: Validate Origin header on mutating requests
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');

      // Allow requests with no origin (same-origin, server-to-server, curl)
      // But block cross-origin requests where origin doesn't match host
      if (origin && host) {
        try {
          const originUrl = new URL(origin);
          // Parse host correctly for IPv6 (e.g. [::1]:3000)
          const hostHostname = host.startsWith('[')
            ? host.substring(0, host.indexOf(']') + 1)  // [::1]
            : host.split(':')[0];                        // localhost
          const isDevMode = process.env.NODE_ENV === 'development';
          // Treat [::1], ::1, and localhost as equivalent loopback in dev
          const loopbacks = ['localhost', '[::1]', '::1', '127.0.0.1'];
          const originIsLoopback = loopbacks.includes(originUrl.hostname);
          const hostIsLoopback = loopbacks.includes(hostHostname);
          const bothLoopback = isDevMode && originIsLoopback && hostIsLoopback;
          if (originUrl.hostname !== hostHostname && !bothLoopback) {
            return NextResponse.json(
              { error: 'Cross-origin requests are not allowed.' },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: 'Invalid origin header.' },
            { status: 403 }
          );
        }
      }

      // Body size check via Content-Length header
      const contentLength = request.headers.get('content-length');
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        if (Number.isFinite(size) && size > MAX_BODY_BYTES) {
          return NextResponse.json(
            { error: `Request body too large. Maximum is ${(MAX_BODY_BYTES / 1024 / 1024).toFixed(0)}MB.` },
            { status: 413 }
          );
        }
      }
    }
  }

  // ── Apply Security Headers ──────────────────────────────────────────────
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // CSP: Allow self, inline styles, Google Fonts, AdSense, and Google Analytics
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self' blob: data:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com https://partner.googleadservices.com https://tpc.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://*.google.com",
      "connect-src 'self' blob: https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://*.google.com",
      "worker-src 'self' blob:",
      "object-src 'self' blob:",
      "frame-src 'self' blob: https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.google.com https://*.googlesyndication.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // HSTS (only meaningful over HTTPS, but safe to include always)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}

// Only run proxy on pages and API routes — skip static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
