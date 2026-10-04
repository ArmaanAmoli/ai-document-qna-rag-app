import Redis from 'ioredis';
import { createHash } from 'crypto';

// Redis client singleton
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: times => {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 200, 2000);
      },
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('error', err => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });
  }
  return redisClient;
}

// Generate cache key from query embedding (for semantic cache)
export function generateSemanticCacheKey(embedding: number[], tenantId?: string): string {
  // Round embeddings to reduce cardinality while preserving similarity
  const rounded = embedding.map(v => Math.round(v * 1000) / 1000);
  const hash = createHash('sha256').update(JSON.stringify(rounded)).digest('hex').slice(0, 16);
  return `semantic:${tenantId || 'global'}:${hash}`;
}

// Generate cache key from query text (for exact match cache)
export function generateExactCacheKey(query: string, tenantId?: string): string {
  const hash = createHash('sha256').update(query.toLowerCase().trim()).digest('hex').slice(0, 16);
  return `exact:${tenantId || 'global'}:${hash}`;
}

// Generate cache key for embedding cache
export function generateEmbeddingCacheKey(text: string): string {
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 16);
  return `embedding:${hash}`;
}

// Semantic cache: find similar cached queries using vector similarity
export async function semanticCacheLookup(
  queryEmbedding: number[],
  threshold: number = 0.95,
  tenantId?: string
): Promise<{ answer: string; metadata: Record<string, unknown> } | null> {
  const redis = getRedisClient();

  try {
    // For now, use exact key lookup with threshold-based fallback
    // In production, you'd use Redis Vector Similarity Search (Redis Stack)
    // or a dedicated vector DB for semantic cache

    // Check exact match first
    const exactKey = generateExactCacheKey(JSON.stringify(queryEmbedding), tenantId);
    const exactCached = await redis.get(exactKey);

    if (exactCached) {
      const parsed = JSON.parse(exactCached);
      console.log('Exact semantic cache hit');
      return parsed;
    }

    // TODO: Implement vector similarity search for semantic cache
    // This would require Redis Stack with RediSearch module
    // or a separate vector index

    return null;
  } catch (error) {
    console.error('Semantic cache lookup error:', error);
    return null;
  }
}

// Store in semantic cache
export async function semanticCacheStore(
  queryEmbedding: number[],
  answer: string,
  metadata: Record<string, unknown>,
  ttlSeconds: number = 3600, // 1 hour default
  tenantId?: string
): Promise<void> {
  const redis = getRedisClient();

  try {
    const exactKey = generateExactCacheKey(JSON.stringify(queryEmbedding), tenantId);
    const value = JSON.stringify({ answer, metadata, cachedAt: new Date().toISOString() });

    await redis.setex(exactKey, ttlSeconds, value);
    console.log('Stored in semantic cache');
  } catch (error) {
    console.error('Semantic cache store error:', error);
  }
}

// Embedding cache: cache query embeddings to avoid recomputation
export async function embeddingCacheLookup(text: string): Promise<number[] | null> {
  const redis = getRedisClient();

  try {
    const key = generateEmbeddingCacheKey(text);
    const cached = await redis.get(key);

    if (cached) {
      console.log('Embedding cache hit');
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Embedding cache lookup error:', error);
    return null;
  }
}

export async function embeddingCacheStore(
  text: string,
  embedding: number[],
  ttlSeconds: number = 86400 // 24 hours
): Promise<void> {
  const redis = getRedisClient();

  try {
    const key = generateEmbeddingCacheKey(text);
    await redis.setex(key, ttlSeconds, JSON.stringify(embedding));
    console.log('Stored embedding in cache');
  } catch (error) {
    console.error('Embedding cache store error:', error);
  }
}

// Response cache: full response caching for identical queries
export async function responseCacheLookup(
  query: string,
  tenantId?: string
): Promise<{ answer: string; sources: string[]; metadata: Record<string, unknown> } | null> {
  const redis = getRedisClient();

  try {
    const key = generateExactCacheKey(query, tenantId);
    const cached = await redis.get(key);

    if (cached) {
      console.log('Response cache hit');
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Response cache lookup error:', error);
    return null;
  }
}

export async function responseCacheStore(
  query: string,
  answer: string,
  sources: string[],
  metadata: Record<string, unknown>,
  ttlSeconds: number = 3600,
  tenantId?: string
): Promise<void> {
  const redis = getRedisClient();

  try {
    const key = generateExactCacheKey(query, tenantId);
    const value = JSON.stringify({ answer, sources, metadata, cachedAt: new Date().toISOString() });

    await redis.setex(key, ttlSeconds, value);
    console.log('Stored response in cache');
  } catch (error) {
    console.error('Response cache store error:', error);
  }
}

// Cache invalidation: invalidate by pattern (e.g., when documents update)
export async function invalidateCacheByPattern(pattern: string): Promise<number> {
  const redis = getRedisClient();

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      const deleted = await redis.del(...keys);
      console.log(`Invalidated ${deleted} cache keys matching pattern: ${pattern}`);
      return deleted;
    }
    return 0;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return 0;
  }
}

// Invalidate cache for a specific document
export async function invalidateDocumentCache(documentId: string): Promise<void> {
  await invalidateCacheByPattern(`*document:${documentId}*`);
  await invalidateCacheByPattern(`*docId:${documentId}*`);
}

// Invalidate all cache for a tenant
export async function invalidateTenantCache(tenantId: string): Promise<void> {
  await invalidateCacheByPattern(`*:${tenantId}:*`);
}

// Cache stats for monitoring
export async function getCacheStats(): Promise<{
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
}> {
  const redis = getRedisClient();

  try {
    const info = await redis.info('memory');
    const keyspace = await redis.info('keyspace');

    // Parse memory usage
    const memoryMatch = info.match(/used_memory_human:(\S+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

    // Parse total keys
    let totalKeys = 0;
    const keyspaceLines = keyspace.split('\n');
    for (const line of keyspaceLines) {
      const match = line.match(/keys=(\d+)/);
      if (match) totalKeys += parseInt(match[1], 10);
    }

    return {
      totalKeys,
      memoryUsage,
      hitRate: 0, // Would need to track hits/misses separately
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { totalKeys: 0, memoryUsage: 'unknown', hitRate: 0 };
  }
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
