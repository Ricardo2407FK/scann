// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine v6.0 — Circuit Breaker Pattern
// v6.0: Jitter-based cooldown to prevent thundering herd recovery
// Prevents cascading failures when search engines rate-limit or go down.
// Three-state machine: CLOSED → OPEN → HALF_OPEN → CLOSED
// ═══════════════════════════════════════════════════════════════════════════════

export enum CircuitState {
  /** Normal operation — all requests flow through */
  CLOSED = 'CLOSED',
  /** Engine is failing — skip requests until cooldown expires */
  OPEN = 'OPEN',
  /** Cooldown expired — allow a single probe request to test recovery */
  HALF_OPEN = 'HALF_OPEN',
}

export type CircuitBreakerStats = {
  name: string;
  state: CircuitState;
  failures: number;
  successesSinceHalfOpen: number;
  lastFailureTime: number;
  totalTrips: number;
};

/**
 * Circuit breaker for individual search engines.
 *
 * When an engine fails `failureThreshold` times consecutively, the circuit
 * "opens" and all subsequent calls are short-circuited (return fallback)
 * for `cooldownMs` milliseconds. After cooldown, the circuit enters
 * HALF_OPEN and allows `halfOpenProbes` test requests. If those succeed,
 * the circuit closes. If any fail, it re-opens.
 *
 * This prevents:
 * - Wasting time on engines that are rate-limiting us
 * - Slow timeouts cascading into global scan timeouts
 * - Burning CPU/bandwidth on guaranteed-to-fail requests
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private successesSinceHalfOpen = 0;
  private lastFailureTime = 0;
  private totalTrips = 0;

  constructor(
    private readonly name: string,
    private readonly failureThreshold: number = 3,
    private readonly cooldownMs: number = 60_000,
    private readonly halfOpenProbes: number = 2,
  ) {}

  /**
   * Check if the circuit allows a request to proceed.
   */
  canExecute(): boolean {
    switch (this.state) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        // Check if cooldown has elapsed (v6.0: add ±15% jitter to prevent thundering herd)
        const jitter = this.cooldownMs * (0.85 + Math.random() * 0.30);
        if (Date.now() - this.lastFailureTime >= jitter) {
          this.state = CircuitState.HALF_OPEN;
          this.successesSinceHalfOpen = 0;
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        // Allow probe requests through
        return true;
    }
  }

  /**
   * Record a successful request — may close the circuit.
   */
  recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successesSinceHalfOpen++;
      if (this.successesSinceHalfOpen >= this.halfOpenProbes) {
        // Recovery confirmed — close the circuit
        this.state = CircuitState.CLOSED;
        this.consecutiveFailures = 0;
      }
    } else {
      // Reset failure count on any success
      this.consecutiveFailures = 0;
    }
  }

  /**
   * Record a failed request — may trip (open) the circuit.
   */
  recordFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Probe failed — re-open immediately
      this.state = CircuitState.OPEN;
      this.totalTrips++;
    } else if (this.consecutiveFailures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.totalTrips++;
    }
  }

  /**
   * Execute a function through the circuit breaker.
   * Returns `fallback` if the circuit is open.
   */
  async execute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    if (!this.canExecute()) return fallback;

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch {
      this.recordFailure();
      return fallback;
    }
  }

  /** Get current circuit breaker stats for diagnostics. */
  getStats(): CircuitBreakerStats {
    return {
      name: this.name,
      state: this.state,
      failures: this.consecutiveFailures,
      successesSinceHalfOpen: this.successesSinceHalfOpen,
      lastFailureTime: this.lastFailureTime,
      totalTrips: this.totalTrips,
    };
  }

  /** Force-reset the circuit (for testing / admin). */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.successesSinceHalfOpen = 0;
    this.lastFailureTime = 0;
  }
}

// ─── Engine-Specific Circuit Breakers (module-level singletons) ─────────────
// Each engine gets its own breaker with tuned thresholds.
// Cooldowns are staggered so engines recover at different times.

export const engineBreakers = {
  duckduckgo: new CircuitBreaker('DuckDuckGo', 3, 45_000, 2),
  yahoo:      new CircuitBreaker('Yahoo', 3, 60_000, 2),
  bing:       new CircuitBreaker('Bing', 3, 50_000, 2),
  google:     new CircuitBreaker('Google', 2, 90_000, 1),   // Google is aggressive — fewer retries, longer cooldown
  wikipedia:  new CircuitBreaker('Wikipedia', 4, 30_000, 2), // Wikipedia is reliable — more lenient
  crossref:   new CircuitBreaker('CrossRef', 3, 60_000, 2),
  scholar:    new CircuitBreaker('Semantic Scholar', 3, 60_000, 2),
};

/**
 * Get diagnostic status for all engine circuit breakers.
 */
export function getAllBreakerStats(): CircuitBreakerStats[] {
  return Object.values(engineBreakers).map(b => b.getStats());
}

/**
 * Count how many engines are currently available (circuit closed or half-open).
 */
export function getAvailableEngineCount(): number {
  return Object.values(engineBreakers).filter(b => b.canExecute()).length;
}
