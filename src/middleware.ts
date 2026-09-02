// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity — Security Middleware
// CORS, CSRF, Security Headers, Request Body Size Limits
// ═══════════════════════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from 'next/server';

// Maximum request body size: 16MB (supports 15MB file uploads)
const MAX_BODY_BYTES = 16 * 1024 * 1024;

// Security headers applied to all responses
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-DNS-Prefetch-Control': 'off',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for PDF export — Content-Disposition must not be interfered with
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

  // CSP: Allow self, inline styles (needed for dynamic styling), Google Fonts,
  // unsafe-eval (required by React dev mode), and blob: for PDF downloads.
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self' blob: data:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' blob:",
      "worker-src 'self' blob:",
      "object-src 'self' blob:",
      "frame-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // HSTS (only meaningful over HTTPS, but safe to include always)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}

// Only run middleware on pages and API routes — skip static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
