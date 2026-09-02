// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Cache & Concurrency Primitives
// v6.0: Improved size estimation, sampling-based array sizing
// LRU cache with optional TTL, memory-bounded, shared-hosting safe.
// ═══════════════════════════════════════════════════════════════════════════════

type CacheEntry<V> = {
  value: V;
  expiresAt: number;   // Infinity = no expiry
  sizeEstimate: number; // Rough byte estimate for memory tracking
};

/**
 * LRU cache with optional per-entry TTL and total memory bound.
 *
 * Improvements over v5.0:
 * - TTL support: entries expire after a configurable duration
 * - Memory estimation: rough tracking to prevent unbounded growth
 * - Lazy expiration: expired entries are evicted on access (no timers)
 * - Periodic sweep: bulk-evicts expired entries on a schedule
 * - Fully backward-compatible: TTL defaults to Infinity (no expiry)
 */
export class LRUCache<K, V> {
  private map = new Map<K, CacheEntry<V>>();
  private estimatedBytes = 0;
  private sweepInterval: ReturnType<typeof setInterval> | null = null;
  private _hits = 0;
  private _misses = 0;

  /**
   * @param capacity - Maximum number of entries
   * @param defaultTtlMs - Default TTL in milliseconds (0 = no expiry)
   * @param maxMemoryBytes - Rough memory ceiling (0 = unlimited)
   */
  constructor(
    private capacity: number,
    private defaultTtlMs: number = 0,
    private maxMemoryBytes: number = 0,
  ) {
    // Periodic sweep every 2 minutes to clear expired entries in bulk
    if (defaultTtlMs > 0) {
      this.sweepInterval = setInterval(() => this.sweep(), 120_000);
      // Prevent the timer from keeping the process alive
      if (this.sweepInterval && typeof this.sweepInterval === 'object' && 'unref' in this.sweepInterval) {
        this.sweepInterval.unref();
      }
    }
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      this._misses++;
      return undefined;
    }

    // Lazy expiration check
    if (entry.expiresAt !== Infinity && Date.now() > entry.expiresAt) {
      this.estimatedBytes -= entry.sizeEstimate;
      this.map.delete(key);
      this._misses++;
      return undefined;
    }

    // Promote to most-recently-used (delete + re-insert)
    this.map.delete(key);
    this.map.set(key, entry);
    this._hits++;
    return entry.value;
  }

  /**
   * Set a cache entry.
   * @param key - Cache key
   * @param value - Cached value
   * @param ttlMs - Optional TTL override for this entry (milliseconds)
   */
  set(key: K, value: V, ttlMs?: number): void {
    // Remove old entry if updating
    if (this.map.has(key)) {
      const old = this.map.get(key)!;
      this.estimatedBytes -= old.sizeEstimate;
      this.map.delete(key);
    }

    const effectiveTtl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = effectiveTtl > 0 ? Date.now() + effectiveTtl : Infinity;
    const sizeEstimate = this.estimateSize(value);

    this.map.set(key, { value, expiresAt, sizeEstimate });
    this.estimatedBytes += sizeEstimate;

    // Evict LRU entries if over capacity
    while (this.map.size > this.capacity) {
      this.evictOldest();
    }

    // Evict if over memory limit
    if (this.maxMemoryBytes > 0) {
      while (this.estimatedBytes > this.maxMemoryBytes && this.map.size > 0) {
        this.evictOldest();
      }
    }
  }

  /** Check if a key exists (and is not expired), without promoting to MRU. */
  has(key: K): boolean {
    const entry = this.map.get(key);
    if (!entry) return false;
    // Lazy expiration check (without promoting)
    if (entry.expiresAt !== Infinity && Date.now() > entry.expiresAt) {
      this.estimatedBytes -= entry.sizeEstimate;
      this.map.delete(key);
      return false;
    }
    return true;
  }

  /** Delete a specific entry. */
  delete(key: K): boolean {
    const entry = this.map.get(key);
    if (entry) {
      this.estimatedBytes -= entry.sizeEstimate;
      this.map.delete(key);
      return true;
    }
    return false;
  }

  /** Number of entries (may include expired entries not yet swept). */
  get size(): number { return this.map.size; }

  /** Rough estimated memory usage in bytes. */
  get memoryUsage(): number { return this.estimatedBytes; }

  /** Total cache hits. */
  get hits(): number { return this._hits; }

  /** Total cache misses. */
  get misses(): number { return this._misses; }

  /** Remove all expired entries. */
  sweep(): number {
    const now = Date.now();
    let swept = 0;
    for (const [key, entry] of this.map) {
      if (entry.expiresAt !== Infinity && now > entry.expiresAt) {
        this.estimatedBytes -= entry.sizeEstimate;
        this.map.delete(key);
        swept++;
      }
    }
    return swept;
  }

  /** Clear all entries. */
  clear(): void {
    this.map.clear();
    this.estimatedBytes = 0;
  }

  /** Stop the sweep timer (for graceful shutdown / tests). */
  destroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
  }

  private evictOldest(): void {
    const first = this.map.keys().next();
    if (!first.done) {
      const entry = this.map.get(first.value);
      if (entry) this.estimatedBytes -= entry.sizeEstimate;
      this.map.delete(first.value);
    }
  }

  /**
   * v6.0: Improved size estimation using sampling.
   * For arrays/objects: sample up to 3 elements and extrapolate.
   * Avoids expensive full JSON.stringify on large objects.
   */
  private estimateSize(value: V): number {
    if (typeof value === 'string') return value.length * 2; // UTF-16
    if (Array.isArray(value)) {
      if (value.length === 0) return 16;
      // Sample first 3 elements and extrapolate
      const sampleSize = Math.min(3, value.length);
      let sampleBytes = 0;
      for (let i = 0; i < sampleSize; i++) {
        const el = value[i];
        if (typeof el === 'string') sampleBytes += el.length * 2;
        else sampleBytes += JSON.stringify(el).length;
      }
      return Math.round((sampleBytes / sampleSize) * value.length);
    }
    if (value && typeof value === 'object') return JSON.stringify(value).length;
    return 64; // scalar fallback
  }
}

// ─── Semaphore (unchanged from v5.0) ────────────────────────────────────────

export class Semaphore {
  private queue: (() => void)[] = [];
  private active = 0;
  constructor(private max: number) {}

  async acquire(): Promise<void> {
    if (this.active < this.max) { this.active++; return; }
    return new Promise(resolve => { this.queue.push(resolve); });
  }

  release(): void {
    this.active--;
    if (this.queue.length > 0) {
      this.active++;
      this.queue.shift()!();
    }
  }
}
