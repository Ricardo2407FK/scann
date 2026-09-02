// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity — PDF Export API Route
// Accepts base64-encoded PDF data via form submission, returns it as a proper
// file download with Content-Disposition header.
// This bypasses ALL blob URL / CSP / browser download attribute issues.
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse form data (submitted via hidden form, not JSON fetch)
    const contentType = request.headers.get('content-type') || '';
    let data: string | null = null;
    let filename = 'Scanterity_Forensic_Report.pdf';

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

    // Validate base64 — must be non-empty and decodable
    if (data.length < 100) {
      return NextResponse.json({ error: 'PDF data too small' }, { status: 400 });
    }

    // Decode base64 to binary
    const pdfBuffer = Buffer.from(data, 'base64');

    // Validate PDF magic bytes (%PDF-)
    if (pdfBuffer.length < 5 || pdfBuffer.toString('ascii', 0, 5) !== '%PDF-') {
      console.error('[export-pdf] Invalid PDF: missing %PDF- header, got:', pdfBuffer.toString('ascii', 0, 10));
      return NextResponse.json({ error: 'Invalid PDF data' }, { status: 400 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    console.log(`[export-pdf] Serving ${safeName} (${pdfBuffer.length} bytes)`);

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
    console.error('[export-pdf] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process PDF export' },
      { status: 500 }
    );
  }
}
