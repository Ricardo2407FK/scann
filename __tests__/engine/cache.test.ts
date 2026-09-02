// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Cache & Semaphore Tests
// ═══════════════════════════════════════════════════════════════════════════════

import { LRUCache, Semaphore } from '@/lib/engine/cache';

// ─── LRUCache ───────────────────────────────────────────────────────────────
describe('LRUCache', () => {
  test('stores and retrieves values', () => {
    const cache = new LRUCache<string, string>(3);
    cache.set('a', 'alpha');
    expect(cache.get('a')).toBe('alpha');
  });

  test('returns undefined for missing keys', () => {
    const cache = new LRUCache<string, string>(3);
    expect(cache.get('missing')).toBeUndefined();
  });

  test('evicts least-recently-used when capacity is exceeded', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // 'a' should be evicted
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('d')).toBe(4);
  });

  test('get promotes entry to most-recently-used', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.get('a'); // Touch 'a' — now 'b' is least recent
    cache.set('d', 4); // 'b' should be evicted
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  test('overwrites existing keys', () => {
    const cache = new LRUCache<string, string>(3);
    cache.set('key', 'old');
    cache.set('key', 'new');
    expect(cache.get('key')).toBe('new');
  });
});

// ─── Semaphore ──────────────────────────────────────────────────────────────
describe('Semaphore', () => {
  test('allows up to capacity concurrent acquisitions', async () => {
    const sem = new Semaphore(2);
    let running = 0;
    let maxRunning = 0;

    const task = async () => {
      await sem.acquire();
      running++;
      maxRunning = Math.max(maxRunning, running);
      // Simulate async work
      await new Promise(r => setTimeout(r, 50));
      running--;
      sem.release();
    };

    await Promise.all([task(), task(), task(), task()]);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  test('queues tasks beyond capacity', async () => {
    const sem = new Semaphore(1);
    const order: number[] = [];

    const task = async (id: number) => {
      await sem.acquire();
      order.push(id);
      await new Promise(r => setTimeout(r, 10));
      sem.release();
    };

    await Promise.all([task(1), task(2), task(3)]);
    // All tasks should have completed
    expect(order).toHaveLength(3);
  });

  test('release unblocks waiting tasks', async () => {
    const sem = new Semaphore(1);
    await sem.acquire();

    let acquired = false;
    const pending = sem.acquire().then(() => { acquired = true; });

    // Not yet acquired since sem is full
    await new Promise(r => setTimeout(r, 10));
    expect(acquired).toBe(false);

    sem.release();
    await pending;
    expect(acquired).toBe(true);
    sem.release();
  });
});
