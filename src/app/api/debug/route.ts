// Minimal diagnostic endpoint — tests which packages work on Vercel
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const results: Record<string, string> = {};

  // Test each package individually
  try { require('natural'); results['natural'] = '✅'; } catch (e: unknown) { results['natural'] = `❌ ${e instanceof Error ? e.message : String(e)}`; }
  try { require('jsdom'); results['jsdom'] = '✅'; } catch (e: unknown) { results['jsdom'] = `❌ ${e instanceof Error ? e.message : String(e)}`; }
  try { require('cheerio'); results['cheerio'] = '✅'; } catch (e: unknown) { results['cheerio'] = `❌ ${e instanceof Error ? e.message : String(e)}`; }
  try { require('axios'); results['axios'] = '✅'; } catch (e: unknown) { results['axios'] = `❌ ${e instanceof Error ? e.message : String(e)}`; }
  try { require('@mozilla/readability'); results['readability'] = '✅'; } catch (e: unknown) { results['readability'] = `❌ ${e instanceof Error ? e.message : String(e)}`; }
  try { require('pdf2json'); results['pdf2json'] = '✅'; } catch (e: unknown) { results['pdf2json'] = `❌ ${e instanceof Error ? e.message : String(e)}`; }
  try { require('mammoth'); results['mammoth'] = '✅'; } catch (e: unknown) { results['mammoth'] = `❌ ${e instanceof Error ? e.message : String(e)}`; }

  return NextResponse.json({
    nodeVersion: process.version,
    platform: process.platform,
    packages: results,
  });
}
