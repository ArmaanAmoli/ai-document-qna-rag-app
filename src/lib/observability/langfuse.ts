import { Langfuse } from 'langfuse';

// Initialize Langfuse client
// Requires LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY environment variables
// Optional: LANGFUSE_HOST for self-hosted instances
export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
  enabled: !!process.env.LANGFUSE_PUBLIC_KEY && !!process.env.LANGFUSE_SECRET_KEY,
  // Flush events asynchronously, don't block the main thread
  flushInterval: 5000,
  flushAt: 10,
});

// Export a no-op client if not configured
export const getLangfuse = () => {
  if (!langfuse.enabled) {
    return {
      trace: () => ({
        span: () => ({ end: () => {}, update: () => {} }),
        end: () => {},
        update: () => {},
      }),
      flushAsync: async () => {},
      shutdownAsync: async () => {},
    } as unknown as Langfuse;
  }
  return langfuse;
};

// Helper to create a trace for a RAG query
export function createRagTrace(params: {
  userId: string;
  sessionId?: string;
  query: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}) {
  const client = getLangfuse();
  return client.trace({
    name: 'rag-query',
    userId: params.userId,
    sessionId: params.sessionId,
    input: params.query,
    tags: ['rag', 'chat'],
    metadata: {
      tenantId: params.tenantId,
      ...params.metadata,
    },
  });
}

// Helper to create a span within a trace
export function createSpan(trace: ReturnType<typeof createRagTrace>, params: {
  name: string;
  input?: unknown;
  metadata?: Record<string, unknown>;
}) {
  return trace.span({
    name: params.name,
    input: params.input,
    metadata: params.metadata,
  });
}
