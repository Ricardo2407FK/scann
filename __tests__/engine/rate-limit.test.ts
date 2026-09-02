// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Rate Limiter Tests
// ═══════════════════════════════════════════════════════════════════════════════

import { checkRateLimit, resetRateLimitStore } from '@/lib/rate-limit';

afterEach(() => {
  resetRateLimitStore();
});

describe('checkRateLimit', () => {
  test('allows requests within the limit', () => {
    const result = checkRateLimit('192.168.1.1', 3, 60_000);
    expect(result.limited).toBe(false);
    expect(result.retryAfterMs).toBe(0);
  });

  test('allows exactly N requests before blocking', () => {
    const ip = '10.0.0.1';
    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit(ip, 5, 60_000);
      expect(r.limited).toBe(false);
    }
    // 6th should be blocked
    const blocked = checkRateLimit(ip, 5, 60_000);
    expect(blocked.limited).toBe(true);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  test('different IPs have independent limits', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('user-a', 3, 60_000);
    }
    const blockedA = checkRateLimit('user-a', 3, 60_000);
    expect(blockedA.limited).toBe(true);

    // user-b should still be allowed
    const allowedB = checkRateLimit('user-b', 3, 60_000);
    expect(allowedB.limited).toBe(false);
  });

  test('requests are allowed again after window expires', () => {
    const ip = '10.0.0.2';
    const windowMs = 100; // 100ms window for fast test

    // Exhaust the limit
    for (let i = 0; i < 2; i++) {
      checkRateLimit(ip, 2, windowMs);
    }
    expect(checkRateLimit(ip, 2, windowMs).limited).toBe(true);

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit(ip, 2, windowMs);
        expect(result.limited).toBe(false);
        resolve();
      }, windowMs + 50);
    });
  });

  test('retryAfterMs is positive when limited', () => {
    const ip = '10.0.0.3';
    checkRateLimit(ip, 1, 60_000);
    const result = checkRateLimit(ip, 1, 60_000);
    expect(result.limited).toBe(true);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
  });

  test('resetRateLimitStore clears all state', () => {
    const ip = '10.0.0.4';
    checkRateLimit(ip, 1, 60_000);
    expect(checkRateLimit(ip, 1, 60_000).limited).toBe(true);

    resetRateLimitStore();

    expect(checkRateLimit(ip, 1, 60_000).limited).toBe(false);
  });
});
