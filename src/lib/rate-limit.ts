import type { NextRequest } from 'next/server';

interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

const buckets = new Map<string, RateLimitState>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function cleanupExpiredBuckets(now: number) {
  if (buckets.size < 1000) return;

  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(request: NextRequest, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const key = `${options.keyPrefix}:${getClientIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      resetAt,
      retryAfter: Math.ceil(options.windowMs / 1000),
    };
  }

  current.count += 1;
  const retryAfter = Math.ceil((current.resetAt - now) / 1000);

  return {
    allowed: current.count <= options.maxRequests,
    limit: options.maxRequests,
    remaining: Math.max(options.maxRequests - current.count, 0),
    resetAt: current.resetAt,
    retryAfter,
  };
}

export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    'Retry-After': String(result.retryAfter),
  };
}