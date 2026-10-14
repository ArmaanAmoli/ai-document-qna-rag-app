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

// Redis client (optional - falls back to in-memory if not configured)
let redisClient: any = null;
let redisConnected = false;

async function getRedisClient() {
  if (redisClient) return redisClient;
  
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  if (!redisUrl) return null;
  
  try {
    // Try to use ioredis if available
    const Redis = (await import('ioredis')).default;
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => times > 3 ? null : Math.min(times * 100, 3000),
      lazyConnect: true,
    });
    
    redisClient.on('error', (err) => {
      console.warn('Redis connection error, falling back to in-memory:', err.message);
      redisConnected = false;
    });
    
    redisClient.on('connect', () => {
      redisConnected = true;
    });
    
    await redisClient.connect();
    return redisClient;
  } catch (e) {
    // ioredis not available or connection failed
    return null;
  }
}

// In-memory store (fallback for development/serverless without Redis)
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

async function incrementInRedis(key: string, windowMs: number): Promise<{ count: number; resetTime: number } | null> {
  const client = await getRedisClient();
  if (!client || !redisConnected) return null;
  
  try {
    const now = Date.now();
    const windowSec = Math.ceil(windowMs / 1000);
    const resetTime = now + windowMs;
    
    // Use Redis INCR with TTL for atomic rate limiting
    const pipeline = client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSec, 'NX');
    pipeline.ttl(key);
    
    const results = await pipeline.exec();
    if (!results) return null;
    
    const count = results[0][1] as number;
    const ttl = results[2][1] as number;
    const actualResetTime = now + (ttl > 0 ? ttl * 1000 : windowMs);
    
    return { count, resetTime: actualResetTime };
  } catch (e) {
    console.warn('Redis rate limit error, falling back to in-memory:', e);
    redisConnected = false;
    return null;
  }
}

async function getFromRedis(key: string): Promise<{ count: number; resetTime: number } | null> {
  const client = await getRedisClient();
  if (!client || !redisConnected) return null;
  
  try {
    const count = await client.get(key);
    const ttl = await client.ttl(key);
    if (count === null) return null;
    return {
      count: parseInt(count, 10),
      resetTime: Date.now() + (ttl > 0 ? ttl * 1000 : 0),
    };
  } catch (e) {
    return null;
  }
}

export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimiter(
    request: NextRequest,
    keyExtractor?: (req: NextRequest) => string
  ): Promise<NextResponse | null> {
    const key = keyExtractor
      ? `${config.keyPrefix}:${keyExtractor(request)}`
      : `${config.keyPrefix}:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'}`;

    const now = Date.now();
    
    // Try Redis first
    let entry = await getFromRedis(key);
    
    if (!entry) {
      // Fallback to in-memory
      entry = rateLimitStore.get(key) || null;
    }

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      const newEntry = { count: 1, resetTime: now + config.windowMs };
      
      // Try to store in Redis
      const redisResult = await incrementInRedis(key, config.windowMs);
      if (!redisResult) {
        rateLimitStore.set(key, newEntry);
      }
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
    
    // Update in Redis
    const redisResult = await incrementInRedis(key, config.windowMs);
    if (!redisResult) {
      rateLimitStore.set(key, entry);
    }

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