// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity Engine — Scan Queue Tests
// ═══════════════════════════════════════════════════════════════════════════════

import { ScanQueue } from '@/lib/engine/scan-queue';

describe('ScanQueue', () => {
  test('allows immediate acquisition when under capacity', async () => {
    const queue = new ScanQueue(3, 10, 5000);
    const slot = await queue.acquire(100);
    expect(slot.position).toBe(0);
    expect(queue.getStats().activeScanCount).toBe(1);
    slot.release();
    expect(queue.getStats().activeScanCount).toBe(0);
  });

  test('allows up to maxConcurrent simultaneous scans', async () => {
    const queue = new ScanQueue(2, 10, 5000);
    const slot1 = await queue.acquire(100);
    const slot2 = await queue.acquire(200);

    expect(queue.getStats().activeScanCount).toBe(2);

    slot1.release();
    slot2.release();
    expect(queue.getStats().activeScanCount).toBe(0);
  });

  test('queues requests beyond capacity', async () => {
    const queue = new ScanQueue(1, 10, 5000);
    const results: number[] = [];

    // First scan takes the slot
    const slot1 = await queue.acquire(100);
    results.push(1);

    // Second scan should queue
    const promise2 = queue.acquire(200).then(slot => {
      results.push(2);
      slot.release();
    });

    expect(queue.getStats().queuedScanCount).toBe(1);

    // Release first slot — should unblock second
    slot1.release();
    await promise2;

    expect(results).toEqual([1, 2]);
    expect(queue.getStats().activeScanCount).toBe(0);
    expect(queue.getStats().queuedScanCount).toBe(0);
  });

  test('prioritizes shorter documents', async () => {
    const queue = new ScanQueue(1, 10, 5000);
    const order: string[] = [];

    // Take the only slot
    const slot = await queue.acquire(100);

    // Queue two scans with different word counts
    const long = queue.acquire(10000).then(s => { order.push('long'); s.release(); });
    const short = queue.acquire(500).then(s => { order.push('short'); s.release(); });

    // Give time for both to enter the queue
    await new Promise(r => setTimeout(r, 10));
    expect(queue.getStats().queuedScanCount).toBe(2);

    // Release the slot — shorter doc should go first
    slot.release();
    await Promise.all([long, short]);

    expect(order).toEqual(['short', 'long']);
  });

  test('rejects when queue is full', async () => {
    const queue = new ScanQueue(1, 2, 5000); // max 2 queued

    // Fill up
    const slot = await queue.acquire(100);
    const _p1 = queue.acquire(200); // queued
    const _p2 = queue.acquire(300); // queued — queue now full

    // This should throw
    await expect(queue.acquire(400)).rejects.toThrow('Server is processing too many documents');

    expect(queue.getStats().totalRejected).toBe(1);

    // Cleanup
    slot.release();
    await Promise.allSettled([_p1, _p2]);
  });

  test('tracks totalProcessed correctly', async () => {
    const queue = new ScanQueue(3, 10, 5000);

    const s1 = await queue.acquire(100);
    const s2 = await queue.acquire(200);
    s1.release();
    s2.release();

    expect(queue.getStats().totalProcessed).toBe(2);
  });

  test('handles concurrent acquire and release', async () => {
    const queue = new ScanQueue(2, 20, 5000);
    let maxActive = 0;

    const task = async (wordCount: number) => {
      const slot = await queue.acquire(wordCount);
      const stats = queue.getStats();
      maxActive = Math.max(maxActive, stats.activeScanCount);
      // Simulate scan work
      await new Promise(r => setTimeout(r, 20));
      slot.release();
    };

    await Promise.all([
      task(100), task(200), task(300), task(400), task(500),
    ]);

    expect(maxActive).toBeLessThanOrEqual(2);
    expect(queue.getStats().activeScanCount).toBe(0);
    expect(queue.getStats().totalProcessed).toBe(5);
  });

  test('queue timeout rejects stale entries', async () => {
    const queue = new ScanQueue(1, 10, 100); // 100ms timeout

    const slot = await queue.acquire(100);

    // This will queue and timeout after 100ms
    const timeoutPromise = queue.acquire(200);

    await expect(timeoutPromise).rejects.toThrow('waited too long');
    expect(queue.getStats().totalRejected).toBe(1);

    slot.release();
  });
});
