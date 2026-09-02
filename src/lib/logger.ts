// ═══════════════════════════════════════════════════════════════════════════════
// Scanterity — Structured Logger (Zero Dependencies)
// JSON-based structured logging with levels, request IDs, and timestamps.
// ═══════════════════════════════════════════════════════════════════════════════

import { config } from './config';

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

let requestCounter = 0;

/** Generate a short request ID for correlation. */
export function generateRequestId(): string {
  requestCounter = (requestCounter + 1) % 1_000_000;
  return `${Date.now().toString(36)}-${requestCounter.toString(36).padStart(4, '0')}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.LOG_LEVEL];
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      process.stdout.write(formatLog('debug', message, meta) + '\n');
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      process.stdout.write(formatLog('info', message, meta) + '\n');
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      process.stderr.write(formatLog('warn', message, meta) + '\n');
    }
  },

  error(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      process.stderr.write(formatLog('error', message, meta) + '\n');
    }
  },

  /** Create a child logger with preset context fields (e.g. requestId). */
  child(context: Record<string, unknown>) {
    return {
      debug: (msg: string, meta?: Record<string, unknown>) => logger.debug(msg, { ...context, ...meta }),
      info: (msg: string, meta?: Record<string, unknown>) => logger.info(msg, { ...context, ...meta }),
      warn: (msg: string, meta?: Record<string, unknown>) => logger.warn(msg, { ...context, ...meta }),
      error: (msg: string, meta?: Record<string, unknown>) => logger.error(msg, { ...context, ...meta }),
    };
  },
};
