// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Multi-Engine Search (7 Engines + Circuit Breakers)
// v6.0: URL-level dedup, DNS timeout, Content-Encoding validation
// ═══════════════════════════════════════════════════════════════════════════════

import * as cheerio from 'cheerio';
import axios, { type AxiosResponse } from 'axios';
// Dynamic import: 'jsdom' has ESM-only deps that crash on Vercel Node v24
async function getJSDOM() {
  const { JSDOM } = await import('jsdom');
  return JSDOM;
}
import { Readability } from '@mozilla/readability';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { LRUCache, Semaphore } from './cache';
import { engineBreakers, getAvailableEngineCount } from './circuit-breaker';
import type { SearchResult } from './types';
import { config } from '../config';
import { logger } from '../logger';

// ─── Global Caches (with TTL for shared hosting memory safety) ──────────────
export const pageCache = new LRUCache<string, string>(config.PAGE_CACHE_CAPACITY, config.PAGE_CACHE_TTL_MS, config.PAGE_CACHE_MAX_BYTES);
export const searchCache = new LRUCache<string, SearchResult[]>(config.SEARCH_CACHE_CAPACITY, config.SEARCH_CACHE_TTL_MS, config.SEARCH_CACHE_MAX_BYTES);

// Concurrency limiter
const fetchSemaphore = new Semaphore(config.FETCH_CONCURRENCY);

const MAX_SOURCE_BYTES = config.MAX_SOURCE_BYTES;
const MAX_REDIRECTS = config.MAX_REDIRECTS;

const HEADERS = {
  'User-Agent': config.USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

// ─── Retry with Exponential Backoff ─────────────────────────────────────────
/**
 * Retry a function with exponential backoff and jitter.
 * Jitter prevents "thundering herd" when multiple engines recover at once.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  baseDelayMs: number = 800,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        // Exponential backoff with ±30% jitter
        const delay = baseDelayMs * Math.pow(2, attempt);
        const jitter = delay * (0.7 + Math.random() * 0.6);
        await new Promise(r => setTimeout(r, jitter));
      }
    }
  }
  throw lastError;
}

// ─── SSRF Protection ────────────────────────────────────────────────────────
function stripBrackets(h: string) { return h.replace(/^\[/, '').replace(/\]$/, ''); }

function isPrivateIPv4(addr: string) {
  const p = addr.split('.').map(Number);
  if (p.length !== 4 || p.some(x => !Number.isInteger(x) || x < 0 || x > 255)) return true;
  const [a, b] = p;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || a >= 224;
}

function isPrivateIPv6(addr: string) {
  const n = stripBrackets(addr).toLowerCase();
  return n === '::' || n === '::1' || n.startsWith('fc') || n.startsWith('fd') ||
    n.startsWith('fe80:') || n.startsWith('ff');
}

function isPrivateAddr(addr: string) {
  const n = stripBrackets(addr);
  const v = isIP(n);
  if (v === 4) return isPrivateIPv4(n);
  if (v === 6) return isPrivateIPv6(n);
  return true;
}

async function getSafeUrl(raw: string): Promise<string | null> {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const host = stripBrackets(url.hostname.toLowerCase());
    if (host === 'localhost' || host.endsWith('.localhost') || (!host.includes('.') && isIP(host) === 0)) return null;
    if (isIP(host) > 0) return isPrivateAddr(host) ? null : url.toString();
    // DNS timeout: 5 seconds max to prevent hanging on unresponsive DNS
    const dnsPromise = lookup(host, { all: true });
    let dnsTimer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      dnsTimer = setTimeout(() => reject(new Error('DNS timeout')), 5000);
    });
    const addrs = await Promise.race([dnsPromise, timeoutPromise]).finally(() => {
      if (dnsTimer) clearTimeout(dnsTimer);
    });
    if (addrs.length === 0 || addrs.some(a => isPrivateAddr(a.address))) return null;
    return url.toString();
  } catch { return null; }
}

// ─── HTML Fetcher ───────────────────────────────────────────────────────────
async function fetchHtml(url: string, redirects = 0): Promise<AxiosResponse<string> | null> {
  const safe = await getSafeUrl(url);
  if (!safe) return null;
  try {
    const res = await axios.get<string>(safe, {
      headers: HEADERS, timeout: 8000, maxContentLength: MAX_SOURCE_BYTES,
      maxBodyLength: MAX_SOURCE_BYTES, maxRedirects: 0, responseType: 'text',
      transformResponse: [d => d], validateStatus: s => s >= 200 && s < 400,
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.location;
      if (!loc || redirects >= MAX_REDIRECTS) return null;
      // v6.0 SSRF fix: re-validate redirect target through getSafeUrl
      const redirectUrl = new URL(loc, safe).toString();
      const safeRedirect = await getSafeUrl(redirectUrl);
      if (!safeRedirect) {
        logger.warn('Redirect blocked by SSRF filter', { from: safe, to: redirectUrl });
        return null;
      }
      return fetchHtml(safeRedirect, redirects + 1);
    }
    return res;
  } catch (err) {
    logger.debug('fetchHtml failed', { url, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

// ─── URL Normalization ──────────────────────────────────────────────────────
function normalizeUrl(raw: string, base?: string): string | null {
  const t = raw.trim();
  if (!t || t.length > 2048) return null; // v6.0: cap URL length to prevent ReDoS
  // Yahoo redirect extraction
  const yr = t.match(/\/RU=([^/]+)\//);
  if (yr?.[1]) return normalizeUrl(decodeURIComponent(yr[1]));
  try {
    const url = new URL(t.startsWith('//') ? `https:${t}` : t, base);
    // DuckDuckGo redirect
    if (url.hostname.includes('duckduckgo.com')) {
      const uddg = url.searchParams.get('uddg');
      if (uddg) return normalizeUrl(uddg);
      return null;
    }
    // Yahoo redirect param
    if (url.hostname.includes('yahoo.com')) {
      const ru = url.searchParams.get('RU');
      if (ru) return normalizeUrl(ru);
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.hostname.includes('duckduckgo.com') || url.hostname.includes('yahoo.com') || url.hostname.includes('bing.com') || url.hostname.includes('google.com')) return null;
    url.hash = '';
    return url.toString();
  } catch { return null; }
}

function pushResult(results: SearchResult[], rawUrl: string | undefined, snippet: string, base: string) {
  if (!rawUrl) return;
  const url = normalizeUrl(rawUrl, base);
  if (url) results.push({ url, snippet });
}

// ─── Source Reliability Classification ──────────────────────────────────────
const ACADEMIC_DOMAINS = ['scholar.google', 'arxiv.org', 'doi.org', 'pubmed', 'jstor.org', 'springer.com', 'sciencedirect', 'ieee.org', 'acm.org', 'ncbi.nlm.nih.gov', 'researchgate.net', 'academia.edu', 'semanticscholar.org', 'nature.com', 'wiley.com', 'tandfonline.com'];
const ENCYCLOPEDIA_DOMAINS = ['wikipedia.org', 'britannica.com', 'encyclopedia.com', 'wikiwand.com'];
const NEWS_DOMAINS = ['reuters.com', 'apnews.com', 'bbc.com', 'nytimes.com', 'washingtonpost.com', 'theguardian.com', 'cnn.com', 'forbes.com'];

export function classifySourceReliability(url: string): { reliability: number; label: string } {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (ACADEMIC_DOMAINS.some(d => host.includes(d))) return { reliability: 1.0, label: 'Academic' };
    if (host.endsWith('.edu') || host.endsWith('.gov') || host.endsWith('.ac.uk')) return { reliability: 0.95, label: 'Institutional' };
    if (ENCYCLOPEDIA_DOMAINS.some(d => host.includes(d))) return { reliability: 0.85, label: 'Encyclopedia' };
    if (NEWS_DOMAINS.some(d => host.includes(d))) return { reliability: 0.8, label: 'News' };
    if (host.endsWith('.org')) return { reliability: 0.7, label: 'Organization' };
    return { reliability: 0.6, label: 'Web' };
  } catch {
    return { reliability: 0.5, label: 'Unknown' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH ENGINES (7 total) — Each wrapped with circuit breaker + retry
// ═══════════════════════════════════════════════════════════════════════════════

// 1. DuckDuckGo
async function searchDuckDuckGoRaw(query: string): Promise<SearchResult[]> {
  const res = await axios.get('https://html.duckduckgo.com/html/', {
    params: { q: query }, headers: HEADERS, timeout: 8000,
  });
  const ct = String(res.headers['content-type'] || '');
  if (!ct.includes('text/html') && !ct.includes('text/plain')) return [];
  const $ = cheerio.load(res.data);
  const results: SearchResult[] = [];
  $('.result').each((_, el) => {
    const rawUrl = $(el).find('.result__a').attr('href') || $(el).find('.result__url').attr('href');
    const snippet = $(el).find('.result__snippet').text().trim();
    pushResult(results, rawUrl, snippet, 'https://html.duckduckgo.com');
  });
  return results;
}
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  return engineBreakers.duckduckgo.execute(
    () => withRetry(() => searchDuckDuckGoRaw(query), 1, 800),
    [],
  );
}

// 2. Yahoo
async function searchYahooRaw(query: string): Promise<SearchResult[]> {
  const res = await axios.get('https://search.yahoo.com/search', {
    params: { p: query }, headers: HEADERS, timeout: 8000,
  });
  const ct = String(res.headers['content-type'] || '');
  if (!ct.includes('text/html') && !ct.includes('text/plain')) return [];
  const $ = cheerio.load(res.data);
  const results: SearchResult[] = [];
  $('.algo').each((_, el) => {
    const rawUrl = $(el).find('a').attr('href');
    const snippet = $(el).find('.compText').text().trim() || $(el).find('.compTitle').text().trim();
    pushResult(results, rawUrl, snippet, 'https://search.yahoo.com');
  });
  return results;
}
async function searchYahoo(query: string): Promise<SearchResult[]> {
  return engineBreakers.yahoo.execute(
    () => withRetry(() => searchYahooRaw(query), 1, 800),
    [],
  );
}

// 3. Bing
async function searchBingRaw(query: string): Promise<SearchResult[]> {
  const res = await axios.get('https://www.bing.com/search', {
    params: { q: query }, headers: HEADERS, timeout: 8000,
  });
  const ct = String(res.headers['content-type'] || '');
  if (!ct.includes('text/html') && !ct.includes('text/plain')) return [];
  const $ = cheerio.load(res.data);
  const results: SearchResult[] = [];
  $('li.b_algo').each((_, el) => {
    const rawUrl = $(el).find('h2 a').attr('href');
    const snippet = $(el).find('.b_caption p').text().trim() || $(el).find('.b_algoSlug').text().trim();
    pushResult(results, rawUrl, snippet, 'https://www.bing.com');
  });
  return results;
}
async function searchBing(query: string): Promise<SearchResult[]> {
  return engineBreakers.bing.execute(
    () => withRetry(() => searchBingRaw(query), 1, 800),
    [],
  );
}

// 4. Google (HTML scraping with robust fallback)
async function searchGoogleRaw(query: string): Promise<SearchResult[]> {
  const res = await axios.get('https://www.google.com/search', {
    params: { q: query, num: 10, hl: 'en' },
    headers: { ...HEADERS, 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' },
    timeout: 8000,
  });
  const ct = String(res.headers['content-type'] || '');
  if (!ct.includes('text/html') && !ct.includes('text/plain')) return [];
  const $ = cheerio.load(res.data);
  const results: SearchResult[] = [];
  $('div.g').each((_, el) => {
    const anchor = $(el).find('a[href^="http"]').first();
    const rawUrl = anchor.attr('href');
    const snippet = $(el).find('.VwiC3b, .IsZvec, .s3v9rd').text().trim()
      || $(el).find('span').text().trim().substring(0, 200);
    if (rawUrl && snippet) pushResult(results, rawUrl, snippet, 'https://www.google.com');
  });
  return results;
}
async function searchGoogle(query: string): Promise<SearchResult[]> {
  return engineBreakers.google.execute(
    () => withRetry(() => searchGoogleRaw(query), 0, 1000), // No retry for Google — very aggressive rate limiting
    [],
  );
}

// 5. Wikipedia API
async function searchWikipediaRaw(query: string): Promise<SearchResult[]> {
  const res = await axios.get('https://en.wikipedia.org/w/api.php', {
    params: { action: 'query', list: 'search', srsearch: query, format: 'json', utf8: 1, srlimit: 5 },
    headers: HEADERS, timeout: 8000,
  });
  const results: SearchResult[] = [];
  if (res.data?.query?.search) {
    for (const item of res.data.query.search) {
      const snippet = String(item.snippet || '').replace(/<\/?[^>]+(>|$)/g, '');
      results.push({ url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`, snippet });
    }
  }
  return results;
}
async function searchWikipedia(query: string): Promise<SearchResult[]> {
  return engineBreakers.wikipedia.execute(
    () => withRetry(() => searchWikipediaRaw(query), 1, 500),
    [],
  );
}

// 6. CrossRef API (Free — Academic papers)
async function searchCrossRefRaw(query: string): Promise<SearchResult[]> {
  const res = await axios.get('https://api.crossref.org/works', {
    params: { query, rows: 5, select: 'DOI,title,abstract' },
    headers: { ...HEADERS, 'User-Agent': 'ScanterityPlagiarism/6.0 (https://scanterity.com; mailto:hello@scanterity.com)' },
    timeout: 10000,
  });
  const results: SearchResult[] = [];
  if (res.data?.message?.items) {
    for (const item of res.data.message.items) {
      const title = Array.isArray(item.title) ? item.title[0] : item.title || '';
      const abstract = typeof item.abstract === 'string' ? item.abstract.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 200) : '';
      if (item.DOI) {
        results.push({ url: `https://doi.org/${item.DOI}`, snippet: `${title}. ${abstract}`.trim() });
      }
    }
  }
  return results;
}
async function searchCrossRef(query: string): Promise<SearchResult[]> {
  return engineBreakers.crossref.execute(
    () => withRetry(() => searchCrossRefRaw(query), 1, 1000),
    [],
  );
}

// 7. Semantic Scholar API (Free — Research papers)
async function searchSemanticScholarRaw(query: string): Promise<SearchResult[]> {
  const res = await axios.get('https://api.semanticscholar.org/graph/v1/paper/search', {
    params: { query, limit: 5, fields: 'title,abstract,url' },
    headers: HEADERS, timeout: 10000,
  });
  const results: SearchResult[] = [];
  if (res.data?.data) {
    for (const paper of res.data.data) {
      const snippet = String(paper.abstract || paper.title || '').substring(0, 200);
      const url = paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`;
      results.push({ url, snippet });
    }
  }
  return results;
}
async function searchSemanticScholar(query: string): Promise<SearchResult[]> {
  return engineBreakers.scholar.execute(
    () => withRetry(() => searchSemanticScholarRaw(query), 1, 1000),
    [],
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARALLEL MULTI-ENGINE SEARCH WITH DEDUPLICATION + CIRCUIT BREAKER AWARENESS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run all available engines in parallel for a single query, deduplicate by URL.
 * Engines with open circuit breakers are automatically skipped (zero latency penalty).
 */
export async function searchAllEngines(query: string): Promise<SearchResult[]> {
  const cached = searchCache.get(query);
  if (cached) return cached;

  // Log how many engines are available (for diagnostics)
  const available = getAvailableEngineCount();
  if (available === 0) {
    logger.warn('All search engines have open circuit breakers — zero engines available', {
      breakers: Object.entries(engineBreakers).map(([engineName, b]) => ({ engineName, ...b.getStats() })),
    });
    return [];
  }

  // Run engines in parallel — skip scraping engines if disabled
  const scrapingEnabled = config.ENABLE_SCRAPING_ENGINES;
  const [ddg, yahoo, bing, google, wiki, crossref, scholar] = await Promise.allSettled([
    scrapingEnabled ? searchDuckDuckGo(query) : Promise.resolve([]),
    scrapingEnabled ? searchYahoo(query) : Promise.resolve([]),
    scrapingEnabled ? searchBing(query) : Promise.resolve([]),
    scrapingEnabled ? searchGoogle(query) : Promise.resolve([]),
    searchWikipedia(query),
    searchCrossRef(query),
    searchSemanticScholar(query),
  ]);

  const all: SearchResult[] = [];
  // v6.0: URL-level dedup (not domain-level) — different pages on the same domain
  // are distinct sources and should both be analyzed
  const seenUrls = new Set<string>();

  const add = (settled: PromiseSettledResult<SearchResult[]>) => {
    if (settled.status === 'fulfilled') {
      for (const r of settled.value) {
        // Normalize URL for dedup: strip trailing slash, lowercase hostname
        let normalizedUrl = r.url;
        try {
          const parsed = new URL(r.url);
          parsed.hash = '';
          normalizedUrl = parsed.toString().replace(/\/$/, '');
        } catch { /* keep original */ }
        if (!seenUrls.has(normalizedUrl)) {
          seenUrls.add(normalizedUrl);
          all.push(r);
        }
      }
    }
  };

  // Priority order: academic first, then general
  add(crossref);
  add(scholar);
  add(google);
  add(bing);
  add(ddg);
  add(yahoo);
  add(wiki);

  if (all.length > 0) searchCache.set(query, all);
  return all;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE TEXT EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchPageText(url: string): Promise<string> {
  const cached = pageCache.get(url);
  if (cached) return cached;

  await fetchSemaphore.acquire();
  try {
    const res = await fetchHtml(url);
    if (!res) return '';
    const ct = String(res.headers['content-type'] || '').toLowerCase();
    // Reject binary content types that occasionally masquerade as text
    if (ct.includes('image/') || ct.includes('audio/') || ct.includes('video/') || ct.includes('application/pdf') || ct.includes('application/zip')) return '';
    if (!ct.includes('text/html') && !ct.includes('text/plain') && !ct.includes('application/xhtml')) return '';

    // v6.0: Content-Encoding validation — reject suspiciously large decompressed content
    const contentLength = parseInt(String(res.headers['content-length'] || '0'), 10);
    const bodyLength = typeof res.data === 'string' ? res.data.length : 0;
    if (contentLength > 0 && bodyLength > contentLength * 20) {
      logger.warn('Possible gzip bomb detected', { url, contentLength, bodyLength });
      return '';
    }

    // Parse with a 10-second timeout — prevents a malformed page from blocking a slot
    let parseTimer: ReturnType<typeof setTimeout> | undefined;
    const JSDOM = await getJSDOM();
    const parsePromise = new Promise<string>((resolve) => {
      try {
        const dom = new JSDOM(res.data, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        const text = article?.textContent ? article.textContent.replace(/\s+/g, ' ').toLowerCase().trim() : '';
        // v6.0: Close JSDOM window to free DOM memory
        dom.window.close();
        resolve(text);
      } catch (parseErr) {
        logger.warn('HTML parse failed', { url, error: parseErr instanceof Error ? parseErr.message : String(parseErr) });
        resolve('');
      }
    });
    const timeoutPromise = new Promise<string>((resolve) => {
      parseTimer = setTimeout(() => resolve(''), 10_000);
    });
    const text = await Promise.race([parsePromise, timeoutPromise]).finally(() => {
      if (parseTimer) clearTimeout(parseTimer);
    });

    if (text.length > 50) pageCache.set(url, text);
    return text;
  } catch (err) {
    logger.warn('fetchPageText failed', { url, error: err instanceof Error ? err.message : String(err) });
    return '';
  }
  finally { fetchSemaphore.release(); }
}
