import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { config } from '@/lib/config';
import { logger, generateRequestId } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_FILE_BYTES = config.MAX_FILE_BYTES;
const SUPPORTED_EXTENSIONS = new Set(['txt', 'pdf', 'docx']);

type PdfParserError = {
  parserError?: Error;
};

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function getParserError(error: PdfParserError | Error) {
  if (error instanceof Error) return error;
  return error.parserError || new Error('PDF parsing failed');
}

async function parsePdf(buffer: Buffer) {
  // Dynamic require to avoid Turbopack bundling issues with native modules
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFParser = require('pdf2json');
  const pdfParser = new PDFParser(null, true);

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('PDF parsing timed out after 25s')), 25_000);
    pdfParser.on('pdfParser_dataError', (error: PdfParserError | Error) => {
      clearTimeout(timeout);
      reject(getParserError(error));
    });
    pdfParser.on('pdfParser_dataReady', () => {
      clearTimeout(timeout);
      resolve(pdfParser.getRawTextContent());
    });
    pdfParser.parseBuffer(buffer);
  });
}

async function parseDocx(buffer: Buffer) {
  // Dynamic require to avoid Turbopack bundling issues with native modules
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value as string;
}


export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const { limited, retryAfterMs } = checkRateLimit(ip, config.RATE_LIMIT_PARSE_MAX, config.RATE_LIMIT_PARSE_WINDOW_MS);
  if (limited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  try {
    const formData = await req.formData();
    const fileValue = formData.get('file');
    
    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (fileValue.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 15 MB upload limit' }, { status: 413 });
    }

    const extension = getFileExtension(fileValue.name);
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: 'Unsupported file type. Upload .txt, .pdf, or .docx' }, { status: 415 });
    }

    const requestId = generateRequestId();
    const log = logger.child({ requestId, handler: 'parse-pdf' });

    log.info('Processing file', { extension, fileName: fileValue.name, sizeKB: (fileValue.size / 1024).toFixed(1) });

    let text = '';

    if (extension === 'txt') {
      text = await fileValue.text();
    } else {
      const arrayBuffer = await fileValue.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (extension === 'pdf') {
        // Validate PDF magic bytes (%PDF)
        if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== '%PDF') {
          return NextResponse.json(
            { error: 'File appears corrupted or is not a valid PDF. Please upload a genuine PDF document.' },
            { status: 422 },
          );
        }
        text = await parsePdf(buffer);
      } else {
        // Validate DOCX magic bytes (PK ZIP header)
        if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
          return NextResponse.json(
            { error: 'File appears corrupted or is not a valid DOCX. Please upload a genuine Word document.' },
            { status: 422 },
          );
        }
        text = await parseDocx(buffer);
      }
    }

    // Clean up common artefacts from pdf2json
    text = text.replace(/----------------Page \(\d+\) Break----------------/g, '\n').trim();
    
    log.info('Text extraction complete', { fileName: fileValue.name, chars: text.length });
    return NextResponse.json({ text }, { headers: { 'X-Request-Id': requestId } });
  } catch (error) {
    logger.error('File parse error', { error: error instanceof Error ? error.message : String(error) });
    const msg = error instanceof Error ? error.message : 'Failed to parse document';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
