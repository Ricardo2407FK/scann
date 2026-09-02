// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity v6.0 — Centralized Configuration (Environment-Variable Driven)
// All hardcoded values are now configurable via env vars with safe defaults.
// ═══════════════════════════════════════════════════════════════════════════════

function envInt(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envBool(key: string, fallback: boolean): boolean {
  const val = process.env[key]?.toLowerCase();
  if (!val) return fallback;
  return val === 'true' || val === '1' || val === 'yes';
}

function envStr(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// ─── Scan Engine Configuration ──────────────────────────────────────────────
export const config = {
  // Document limits
  MAX_WORDS: envInt('Scanterity_MAX_WORDS', 15000),
  MAX_INPUT_CHARS: envInt('Scanterity_MAX_INPUT_CHARS', 500_000),
  MAX_FILE_BYTES: envInt('Scanterity_MAX_FILE_BYTES', 15 * 1024 * 1024),

  // Probe & source limits
  MAX_PROBES: envInt('Scanterity_MAX_PROBES', 20),             // v6.0: was 14
  MAX_SOURCE_URLS: envInt('Scanterity_MAX_SOURCE_URLS', 18),   // v6.0: was 12
  MAX_SOURCE_SENTS: envInt('Scanterity_MAX_SOURCE_SENTS', 180), // v6.0: was 150
  MIN_MATCH_WORDS: envInt('Scanterity_MIN_MATCH_WORDS', 6),

  // Search
  SEARCH_BATCH: envInt('Scanterity_SEARCH_BATCH', 6),
  BATCH_SLEEP_MS: envInt('Scanterity_BATCH_SLEEP_MS', 300),
  ENABLE_SCRAPING_ENGINES: envBool('Scanterity_ENABLE_SCRAPING_ENGINES', true),

  // Timeouts
  GLOBAL_TIMEOUT_MS: envInt('Scanterity_GLOBAL_TIMEOUT_MS', 150_000),
  SEARCH_TIMEOUT_MS: envInt('Scanterity_SEARCH_TIMEOUT_MS', 8000),
  PAGE_FETCH_TIMEOUT_MS: envInt('Scanterity_PAGE_FETCH_TIMEOUT_MS', 8000),
  PAGE_PARSE_TIMEOUT_MS: envInt('Scanterity_PAGE_PARSE_TIMEOUT_MS', 10_000),

  // Performance
  YIELD_EVERY_N: envInt('Scanterity_YIELD_EVERY_N', 12),
  HIGH_CONFIDENCE_CUTOFF: 0.95,

  // Rate limiting
  RATE_LIMIT_SCAN_MAX: envInt('Scanterity_RATE_LIMIT_SCAN_MAX', 5),
  RATE_LIMIT_SCAN_WINDOW_MS: envInt('Scanterity_RATE_LIMIT_SCAN_WINDOW_MS', 60_000),
  RATE_LIMIT_PARSE_MAX: envInt('Scanterity_RATE_LIMIT_PARSE_MAX', 10),
  RATE_LIMIT_PARSE_WINDOW_MS: envInt('Scanterity_RATE_LIMIT_PARSE_WINDOW_MS', 60_000),

  // Scan queue
  SCAN_QUEUE_MAX_CONCURRENT: envInt('Scanterity_SCAN_QUEUE_MAX_CONCURRENT', 3),
  SCAN_QUEUE_MAX_DEPTH: envInt('Scanterity_SCAN_QUEUE_MAX_DEPTH', 20),
  SCAN_QUEUE_TIMEOUT_MS: envInt('Scanterity_SCAN_QUEUE_TIMEOUT_MS', 120_000),

  // Cache
  PAGE_CACHE_CAPACITY: envInt('Scanterity_PAGE_CACHE_CAPACITY', 500),
  PAGE_CACHE_TTL_MS: envInt('Scanterity_PAGE_CACHE_TTL_MS', 3_600_000),
  PAGE_CACHE_MAX_BYTES: envInt('Scanterity_PAGE_CACHE_MAX_BYTES', 50_000_000),
  SEARCH_CACHE_CAPACITY: envInt('Scanterity_SEARCH_CACHE_CAPACITY', 1000),
  SEARCH_CACHE_TTL_MS: envInt('Scanterity_SEARCH_CACHE_TTL_MS', 900_000),
  SEARCH_CACHE_MAX_BYTES: envInt('Scanterity_SEARCH_CACHE_MAX_BYTES', 5_000_000),

  // Fetch concurrency
  FETCH_CONCURRENCY: envInt('Scanterity_FETCH_CONCURRENCY', 16), // v6.0: was 12
  MAX_SOURCE_BYTES: envInt('Scanterity_MAX_SOURCE_BYTES', 2_000_000),
  MAX_REDIRECTS: envInt('Scanterity_MAX_REDIRECTS', 3),

  // Logging
  LOG_LEVEL: envStr('Scanterity_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',

  // Identity (for ethical API access)
  USER_AGENT: envStr('Scanterity_USER_AGENT', 'Scanterity/6.0 (Plagiarism Checker; +https://github.com/Scanterity)'),
  CONTACT_EMAIL: envStr('Scanterity_CONTACT_EMAIL', 'hello@scanterity.com'),
} as const;

export type AppConfig = typeof config;
