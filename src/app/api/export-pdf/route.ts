// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity — PDF Export API Route
// Accepts base64-encoded PDF data via form submission, returns it as a proper
// file download with Content-Disposition header.
// This bypasses ALL blob URL / CSP / browser download attribute issues.
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BASE64_LENGTH = 25 * 1024 * 1024;
const DEFAULT_FILENAME = 'Scanterity_Forensic_Report.pdf';

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return true;
  try {
    const originUrl = new URL(origin);
    const hostHostname = host.startsWith('[')
      ? host.substring(0, host.indexOf(']') + 1)
      : host.split(':')[0];
    const loopbacks = ['localhost', '[::1]', '::1', '127.0.0.1'];
    const bothLoopback =
      process.env.NODE_ENV === 'development' &&
      loopbacks.includes(originUrl.hostname) &&
      loopbacks.includes(hostHostname);
    return originUrl.hostname === hostHostname || bothLoopback;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 });
  }

  try {
    // Parse form data (submitted via hidden form, not JSON fetch)
    const contentType = request.headers.get('content-type') || '';
    let data: string | null = null;
    let filename = DEFAULT_FILENAME;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = formData.get('data') as string;
      filename = (formData.get('filename') as string) || filename;
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      data = body.data;
      filename = body.filename || filename;
    } else {
      // Try formData as fallback
      const formData = await request.formData();
      data = formData.get('data') as string;
      filename = (formData.get('filename') as string) || filename;
    }

    if (!data || typeof data !== 'string') {
      return NextResponse.json({ error: 'Missing PDF data' }, { status: 400 });
    }

    // Validate base64 bounds — must be non-empty and within safe limit
    if (data.length < 100) {
      return NextResponse.json({ error: 'PDF data too small' }, { status: 400 });
    }
    if (data.length > MAX_BASE64_LENGTH) {
      return NextResponse.json({ error: 'PDF payload too large' }, { status: 413 });
    }

    // Decode base64 to binary
    const pdfBuffer = Buffer.from(data, 'base64');

    // Validate PDF magic bytes (%PDF-)
    if (pdfBuffer.length < 5 || pdfBuffer.toString('ascii', 0, 5) !== '%PDF-') {
      return NextResponse.json({ error: 'Invalid PDF data' }, { status: 400 });
    }

    let safeName = String(filename || DEFAULT_FILENAME).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!safeName || safeName.startsWith('.')) {
      safeName = DEFAULT_FILENAME;
    }
    if (!safeName.toLowerCase().endsWith('.pdf')) {
      safeName += '.pdf';
    }

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[export-pdf] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to process PDF export' },
      { status: 500 }
    );
  }
}
