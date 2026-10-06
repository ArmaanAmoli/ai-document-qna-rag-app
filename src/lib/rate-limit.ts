import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Every minute

export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimiter(
    request: NextRequest,
    keyExtractor?: (req: NextRequest) => string
  ): Promise<NextResponse | null> {
    const key = keyExtractor
      ? `${config.keyPrefix}:${keyExtractor(request)}`
      : `${config.keyPrefix}:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'}`;

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow request
    }

    if (entry.count >= config.maxRequests) {
      // Rate limited
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
          },
        }
      );
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(config.maxRequests - entry.count));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));

    return null; // Allow request
  };
}

// Pre-configured rate limiters
const uploadLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: parseInt(process.env.RATE_LIMIT_UPLOADS_PER_MINUTE || '10', 10),
  keyPrefix: 'upload',
});

const questionLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: parseInt(process.env.RATE_LIMIT_QUESTIONS_PER_MINUTE || '20', 10),
  keyPrefix: 'question',
});

const embeddingLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: parseInt(process.env.RATE_LIMIT_EMBEDDINGS_PER_MINUTE || '50', 10),
  keyPrefix: 'embedding',
});

const authLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 5, // 5 auth attempts per minute
  keyPrefix: 'auth',
});

export { uploadLimiter, questionLimiter, embeddingLimiter, authLimiter };

// Helper to apply rate limiter to a route handler
export async function withRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof createRateLimiter>,
  handler: (req: NextRequest) => Promise<NextResponse>,
  keyExtractor?: (req: NextRequest) => string
): Promise<NextResponse> {
  const rateLimitResponse = await limiter(request, keyExtractor);
  if (rateLimitResponse) return rateLimitResponse;
  return handler(request);
}
