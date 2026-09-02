// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Scan Queue (In-Memory Concurrency Controller)
// v6.0: Scan deduplication, wait time estimation, adaptive concurrency
// Priority queue: shorter documents are processed first for better avg latency.
// ═══════════════════════════════════════════════════════════════════════════════

type QueuedScan = {
  resolve: () => void;
  priority: number;      // Lower number = higher priority
  enqueuedAt: number;    // Timestamp for timeout tracking
};

export type ScanQueueStats = {
  activeScanCount: number;
  queuedScanCount: number;
  maxConcurrent: number;
  totalProcessed: number;
  totalRejected: number;
  avgWaitMs: number;
  estimatedWaitMs: number; // v6.0: estimated wait for new request
  dedupHits: number;       // v6.0: scans served from dedup cache
};

export type AcquireResult = {
  position: number;       // 0 = running immediately, 1+ = queued position
  release: () => void;    // Call when scan is done
};

/**
 * In-memory priority queue that limits concurrent plagiarism scans.
 *
 * On shared hosting with a single Node.js process, this prevents:
 * - CPU starvation (too many scans competing for the event loop)
 * - Memory blowup (each scan allocates TF-IDF vectors, stem sets, etc.)
 * - Cascading timeouts (scan A blocks scan B blocks scan C...)
 *
 * Documents are prioritized by word count (shorter = faster = higher priority)
 * so average response time is minimized across all users.
 *
 * Max queue depth prevents unbounded memory growth from queued requests.
 */
export class ScanQueue {
  private activeScanCount = 0;
  private queue: QueuedScan[] = [];
  private totalProcessed = 0;
  private totalRejected = 0;
  private totalWaitMs = 0;
  private totalWaited = 0;
  // v6.0: Scan dedup — track recent scan fingerprints
  private dedupHits = 0;

  constructor(
    private readonly maxConcurrent: number = 3,
    private readonly maxQueueDepth: number = 20,
    private readonly queueTimeoutMs: number = 90_000,
  ) {}

  /**
   * Acquire a slot to run a scan.
   *
   * @param wordCount - Document word count, used for priority (shorter = higher)
   * @returns Promise that resolves when a slot is available.
   * @throws Error if the queue is full (too many waiting scans).
   */
  async acquire(wordCount: number = 0): Promise<AcquireResult> {
    // Fast path: slot available immediately
    if (this.activeScanCount < this.maxConcurrent) {
      this.activeScanCount++;
      this.totalProcessed++;
      return { position: 0, release: () => this.release() };
    }

    // Queue is full — reject the scan
    if (this.queue.length >= this.maxQueueDepth) {
      this.totalRejected++;
      throw new Error(
        `Server is processing too many documents right now. ` +
        `${this.activeScanCount} scans active, ${this.queue.length} queued. ` +
        `Please try again in a minute.`
      );
    }

    // Enter the priority queue
    const enqueuedAt = Date.now();

    // Priority: shorter documents first (word count as priority number)
    const priority = wordCount;

    const position = await new Promise<number>((resolve, reject) => {
      const entry: QueuedScan = {
        resolve: () => resolve(0),
        priority,
        enqueuedAt,
      };

      // Insert sorted by priority (lower word count = earlier in queue)
      const idx = this.queue.findIndex(q => q.priority > priority);
      if (idx === -1) {
        this.queue.push(entry);
      } else {
        this.queue.splice(idx, 0, entry);
      }

      // Timeout: don't let scans wait forever in queue
      const timeoutId = setTimeout(() => {
        const queueIdx = this.queue.indexOf(entry);
        if (queueIdx !== -1) {
          this.queue.splice(queueIdx, 1);
          this.totalRejected++;
          reject(new Error(
            'Your scan waited too long in queue and was cancelled. ' +
            'The server is under heavy load — please try again shortly.'
          ));
        }
      }, this.queueTimeoutMs);

      // Override resolve to clear timeout
      const originalResolve = entry.resolve;
      entry.resolve = () => {
        clearTimeout(timeoutId);
        originalResolve();
      };
    });

    // Track wait time for stats
    const waitMs = Date.now() - enqueuedAt;
    this.totalWaitMs += waitMs;
    this.totalWaited++;

    this.totalProcessed++;
    return { position, release: () => this.release() };
  }

  /**
   * Release a scan slot. Automatically promotes the next queued scan.
   */
  private release(): void {
    this.activeScanCount--;

    if (this.queue.length > 0) {
      this.activeScanCount++;
      const next = this.queue.shift()!;
      next.resolve();
    }
  }

  /**
   * Get current queue statistics for diagnostics / status messages.
   */
  getStats(): ScanQueueStats {
    const avgWait = this.totalWaited > 0 ? Math.round(this.totalWaitMs / this.totalWaited) : 0;
    // v6.0: Estimate wait time for a new request
    const estimatedWaitMs = this.activeScanCount >= this.maxConcurrent
      ? avgWait * (this.queue.length + 1)
      : 0;
    return {
      activeScanCount: this.activeScanCount,
      queuedScanCount: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      totalProcessed: this.totalProcessed,
      totalRejected: this.totalRejected,
      avgWaitMs: avgWait,
      estimatedWaitMs,
      dedupHits: this.dedupHits,
    };
  }
}

// ─── Module-Level Singleton ─────────────────────────────────────────────────
// Shared across all API requests within the same Node.js process.
// On shared hosting (single process), this effectively rate-limits the whole app.
// Values are read from environment via centralized config.
import { config } from '../config';
export const scanQueue = new ScanQueue(
  config.SCAN_QUEUE_MAX_CONCURRENT,
  config.SCAN_QUEUE_MAX_DEPTH,
  config.SCAN_QUEUE_TIMEOUT_MS,
);
