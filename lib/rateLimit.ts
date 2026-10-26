/**
 * Lightweight, zero-dependency in-memory sliding-window rate limiter.
 * Protects local and single-instance deployments from rapid automated query flooding.
 *
 * NOTE FOR DISTRIBUTED / PUBLIC PRODUCTION DEPLOYMENTS:
 * For multi-instance, serverless (e.g. Vercel Edge / Lambda), or distributed deployments,
 * a distributed key-value store (such as Upstash Redis or Cloudflare Turnstile / WAF)
 * must be configured as this in-memory cache is local to the active process.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory growth
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupStaleRecords(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSec: number;
}

/**
 * Checks whether an incoming request from an identifier is within the rate limit.
 *
 * @param identifier Client IP or token
 * @param limit Maximum allowed requests in the window (default: 20)
 * @param windowMs Time window in milliseconds (default: 60,000ms = 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60000
): RateLimitResult {
  const now = Date.now();
  cleanupStaleRecords(now, windowMs);

  const windowStart = now - windowMs;
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter out timestamps outside the active window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = oldestTimestamp + windowMs - now;
    const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetMs,
      retryAfterSec,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const resetMs = windowMs;

  return {
    allowed: true,
    limit,
    remaining,
    resetMs,
    retryAfterSec: 0,
  };
}

/**
 * Reset rate limit store (useful for automated test suites).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
