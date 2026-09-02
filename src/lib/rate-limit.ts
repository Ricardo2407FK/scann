// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — In-Memory Rate Limiter (Sliding Window)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simple in-memory sliding-window rate limiter.
 * Tracks request timestamps per IP, removes expired entries on each check.
 * Not shared across workers/serverless instances, but sufficient for single-process.
 */

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const cleanupTimer = setInterval(() => {
  const cutoff = Date.now() - 120_000; // 2-minute window max
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);
// Prevent the timer from keeping the process alive
if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
  cleanupTimer.unref();
}

/** Clear all rate limit state (for tests / graceful shutdown). */
export function resetRateLimitStore(): void {
  store.clear();
}

/**
 * Check if a request from the given IP should be rate-limited.
 * @param ip - The client IP address
 * @param maxRequests - Max requests allowed within the window
 * @param windowMs - Sliding window duration in milliseconds
 * @returns { limited: boolean, retryAfterMs: number }
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number,
): { limited: boolean; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter(t => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    // Calculate how long until the oldest request expires
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = (oldestInWindow + windowMs) - now;
    return { limited: true, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  // Allow request
  entry.timestamps.push(now);
  return { limited: false, retryAfterMs: 0 };
}
