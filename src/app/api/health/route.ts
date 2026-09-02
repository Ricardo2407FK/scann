// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity — Health Check Endpoint
// Returns server status, scan queue stats, circuit breaker states, and cache info.
// ═══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { scanQueue } from '@/lib/engine/scan-queue';
import { getAllBreakerStats, getAvailableEngineCount } from '@/lib/engine/circuit-breaker';
import { pageCache, searchCache } from '@/lib/engine/search';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const startedAt = Date.now();

export async function GET() {
  const queueStats = scanQueue.getStats();
  const breakerStats = getAllBreakerStats();
  const availableEngines = getAvailableEngineCount();

  const health = {
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.round((Date.now() - startedAt) / 1000),
      human: formatUptime(Date.now() - startedAt),
    },
    scanQueue: {
      activeScanCount: queueStats.activeScanCount,
      queuedScanCount: queueStats.queuedScanCount,
      maxConcurrent: queueStats.maxConcurrent,
      totalProcessed: queueStats.totalProcessed,
      totalRejected: queueStats.totalRejected,
      avgWaitMs: queueStats.avgWaitMs,
    },
    searchEngines: {
      available: availableEngines,
      total: breakerStats.length,
      engines: breakerStats.map(b => ({
        name: b.name,
        state: b.state,
        failures: b.failures,
        totalTrips: b.totalTrips,
      })),
    },
    cache: {
      pageCache: {
        entries: pageCache.size,
        memoryBytes: pageCache.memoryUsage,
        memoryHuman: formatBytes(pageCache.memoryUsage),
        hits: pageCache.hits,
        misses: pageCache.misses,
        hitRate: pageCache.hits + pageCache.misses > 0
          ? `${Math.round((pageCache.hits / (pageCache.hits + pageCache.misses)) * 100)}%`
          : 'N/A',
      },
      searchCache: {
        entries: searchCache.size,
        memoryBytes: searchCache.memoryUsage,
        memoryHuman: formatBytes(searchCache.memoryUsage),
        hits: searchCache.hits,
        misses: searchCache.misses,
        hitRate: searchCache.hits + searchCache.misses > 0
          ? `${Math.round((searchCache.hits / (searchCache.hits + searchCache.misses)) * 100)}%`
          : 'N/A',
      },
    },
    version: '6.0.0',
  };

  return NextResponse.json(health, {
    status: 200,
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
  });
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s % 60}s`);
  return parts.join(' ');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}
