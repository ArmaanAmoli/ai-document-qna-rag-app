import { Langfuse } from 'langfuse';

// Check if Langfuse is configured
const isLangfuseConfigured = !!process.env.LANGFUSE_PUBLIC_KEY && !!process.env.LANGFUSE_SECRET_KEY;

// Initialize Langfuse client if configured
export const langfuse = isLangfuseConfigured
  ? new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
      secretKey: process.env.LANGFUSE_SECRET_KEY || '',
      baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
      flushInterval: 5000,
      flushAt: 10,
    })
  : null;

// Export a no-op client if not configured
export const getLangfuse = () => {
  if (!isLangfuseConfigured || !langfuse) {
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
export function createSpan(
  trace: ReturnType<typeof createRagTrace>,
  params: {
    name: string;
    input?: unknown;
    metadata?: Record<string, unknown>;
  }
) {
  return trace.span({
    name: params.name,
    input: params.input,
    metadata: params.metadata,
  });
}
