// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Circuit Breaker Tests
// ═══════════════════════════════════════════════════════════════════════════════

import { CircuitBreaker, CircuitState, engineBreakers, getAvailableEngineCount } from '@/lib/engine/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('TestEngine', 3, 100, 2); // Short cooldown for tests
  });

  test('starts in CLOSED state', () => {
    expect(breaker.getStats().state).toBe(CircuitState.CLOSED);
    expect(breaker.canExecute()).toBe(true);
  });

  test('allows execution when circuit is closed', () => {
    expect(breaker.canExecute()).toBe(true);
    expect(breaker.canExecute()).toBe(true);
    expect(breaker.canExecute()).toBe(true);
  });

  test('stays closed on successful requests', () => {
    breaker.recordSuccess();
    breaker.recordSuccess();
    breaker.recordSuccess();
    expect(breaker.getStats().state).toBe(CircuitState.CLOSED);
    expect(breaker.getStats().failures).toBe(0);
  });

  test('tracks consecutive failures', () => {
    breaker.recordFailure();
    expect(breaker.getStats().failures).toBe(1);
    expect(breaker.getStats().state).toBe(CircuitState.CLOSED);

    breaker.recordFailure();
    expect(breaker.getStats().failures).toBe(2);
    expect(breaker.getStats().state).toBe(CircuitState.CLOSED);
  });

  test('opens circuit after failure threshold', () => {
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure(); // 3rd failure = threshold
    expect(breaker.getStats().state).toBe(CircuitState.OPEN);
    expect(breaker.canExecute()).toBe(false);
  });

  test('rejects requests when circuit is open', () => {
    // Trip the breaker
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.canExecute()).toBe(false);
    expect(breaker.canExecute()).toBe(false);
  });

  test('transitions to HALF_OPEN after cooldown', async () => {
    // Trip the breaker
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.canExecute()).toBe(false);

    // Wait for cooldown (100ms)
    await new Promise(r => setTimeout(r, 150));

    // Should transition to HALF_OPEN on next check
    expect(breaker.canExecute()).toBe(true);
    expect(breaker.getStats().state).toBe(CircuitState.HALF_OPEN);
  });

  test('closes circuit after successful probes in HALF_OPEN', async () => {
    // Trip the breaker
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();

    // Wait for cooldown
    await new Promise(r => setTimeout(r, 150));
    breaker.canExecute(); // Transitions to HALF_OPEN

    // Successful probes
    breaker.recordSuccess();
    expect(breaker.getStats().state).toBe(CircuitState.HALF_OPEN); // Need 2 successes

    breaker.recordSuccess();
    expect(breaker.getStats().state).toBe(CircuitState.CLOSED);
    expect(breaker.getStats().failures).toBe(0);
  });

  test('re-opens circuit if probe fails in HALF_OPEN', async () => {
    // Trip the breaker
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();

    // Wait for cooldown
    await new Promise(r => setTimeout(r, 150));
    breaker.canExecute(); // Transitions to HALF_OPEN

    // Probe fails
    breaker.recordFailure();
    expect(breaker.getStats().state).toBe(CircuitState.OPEN);
  });

  test('resets failure count on any success in CLOSED state', () => {
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getStats().failures).toBe(2);

    breaker.recordSuccess(); // Reset
    expect(breaker.getStats().failures).toBe(0);
  });

  test('tracks total trips', async () => {
    // First trip
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getStats().totalTrips).toBe(1);

    // Recover
    await new Promise(r => setTimeout(r, 150));
    breaker.canExecute();
    breaker.recordSuccess();
    breaker.recordSuccess();

    // Second trip
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getStats().totalTrips).toBe(2);
  });

  test('execute returns result on success', async () => {
    const result = await breaker.execute(async () => 42, 0);
    expect(result).toBe(42);
  });

  test('execute returns fallback on failure', async () => {
    const result = await breaker.execute(async () => { throw new Error('fail'); }, 0);
    expect(result).toBe(0);
  });

  test('execute returns fallback when circuit is open', async () => {
    // Trip the breaker
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();

    const result = await breaker.execute(async () => 42, 0);
    expect(result).toBe(0);
  });

  test('reset clears all state', () => {
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getStats().state).toBe(CircuitState.OPEN);

    breaker.reset();
    expect(breaker.getStats().state).toBe(CircuitState.CLOSED);
    expect(breaker.getStats().failures).toBe(0);
    expect(breaker.canExecute()).toBe(true);
  });
});

describe('engineBreakers', () => {
  beforeEach(() => {
    // Reset all breakers before each test
    Object.values(engineBreakers).forEach(b => b.reset());
  });

  test('has all 7 engines', () => {
    expect(Object.keys(engineBreakers)).toHaveLength(7);
    expect(engineBreakers.duckduckgo).toBeDefined();
    expect(engineBreakers.yahoo).toBeDefined();
    expect(engineBreakers.bing).toBeDefined();
    expect(engineBreakers.google).toBeDefined();
    expect(engineBreakers.wikipedia).toBeDefined();
    expect(engineBreakers.crossref).toBeDefined();
    expect(engineBreakers.scholar).toBeDefined();
  });

  test('getAvailableEngineCount returns 7 when all are healthy', () => {
    expect(getAvailableEngineCount()).toBe(7);
  });

  test('getAvailableEngineCount decreases when engines trip', () => {
    // Trip Google (threshold: 2)
    engineBreakers.google.recordFailure();
    engineBreakers.google.recordFailure();
    expect(getAvailableEngineCount()).toBe(6);

    // Trip DuckDuckGo (threshold: 3)
    engineBreakers.duckduckgo.recordFailure();
    engineBreakers.duckduckgo.recordFailure();
    engineBreakers.duckduckgo.recordFailure();
    expect(getAvailableEngineCount()).toBe(5);
  });
});
