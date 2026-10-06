import { prisma } from '../prisma';
import { Prisma } from '@/generated/prisma/client';

interface SearchResult {
  id: string;
  content: string;
  documentId: string;
  score: number;
  retrievalScores: number[];
}

interface SearchContentOptions {
  embedding: number[];
  limit?: number;
  userId?: string;
  tenantId?: string;
  aclGroups?: string[];
  query?: string; // For BM25 search
}

/**
 * Hybrid search combining vector similarity (pgvector) and full-text search (BM25)
 * with Reciprocal Rank Fusion (RRF) and ACL filtering
 */
export async function searchContent(
  options: SearchContentOptions
): Promise<{ context: string; chunks: SearchResult[] }> {
  const { embedding, limit = 10, tenantId, aclGroups = [], query } = options;

  const contextVector: string = `[${embedding.join(',')}]`;
  const rrfK = 60; // RRF constant
  const vectorLimit = limit * 2; // Get more candidates for fusion
  const textLimit = limit * 2;

  // Build ACL filter - applied at query level for security
  let aclFilter = '';
  const aclParams: unknown[] = [];

  if (tenantId) {
    aclFilter += ' AND "tenantId" = $' + (aclParams.length + 1);
    aclParams.push(tenantId);
  }
  if (aclGroups.length > 0) {
    aclFilter += ' AND "aclGroups" && $' + (aclParams.length + 1);
    aclParams.push(aclGroups);
  }

  // Vector similarity search with ACL filter
  const vectorQuery = Prisma.sql`
    SELECT 
      id,
      content,
      "documentId",
      1.0 - (embedding <=> ${contextVector}::vector) as similarity
    FROM "DocumentChunk"
    WHERE 1=1 ${Prisma.raw(aclFilter)}
    ORDER BY embedding <=> ${contextVector}::vector
    LIMIT ${vectorLimit}
  `;

  // Full-text search (BM25) with ACL filter
  const textQuery = Prisma.sql`
    SELECT 
      id,
      content,
      "documentId",
      ts_rank_cd("contentTsVector", plainto_tsquery('english', ${query || ''})) as rank
    FROM "DocumentChunk"
    WHERE "contentTsVector" @@ plainto_tsquery('english', ${query || ''})
      ${Prisma.raw(aclFilter)}
    ORDER BY rank DESC
    LIMIT ${textLimit}
  `;

  const [vectorResults, textResults] = await Promise.all([
    prisma.$queryRaw<{ id: string; content: string; documentId: string; similarity: number }[]>(
      vectorQuery
    ),
    query
      ? prisma.$queryRaw<{ id: string; content: string; documentId: string; rank: number }[]>(
          textQuery
        )
      : Promise.resolve([]),
  ]);

  // Reciprocal Rank Fusion (RRF)
  const fusedScores = new Map<string, { chunk: SearchResult; score: number }>();

  // Add vector results with RRF scoring
  vectorResults.forEach((result, idx) => {
    const rrfScore = 1 / (rrfK + idx + 1);
    fusedScores.set(result.id, {
      chunk: {
        id: result.id,
        content: result.content,
        documentId: result.documentId,
        score: result.similarity,
        retrievalScores: [result.similarity],
      },
      score: rrfScore,
    });
  });

  // Add text results with RRF scoring (merge)
  textResults.forEach((result, idx) => {
    const rrfScore = 1 / (rrfK + idx + 1);
    const existing = fusedScores.get(result.id);
    if (existing) {
      existing.score += rrfScore;
      existing.chunk.retrievalScores.push(result.rank);
    } else {
      fusedScores.set(result.id, {
        chunk: {
          id: result.id,
          content: result.content,
          documentId: result.documentId,
          score: result.rank,
          retrievalScores: [result.rank],
        },
        score: rrfScore,
      });
    }
  });

  // Sort by fused score and take top-k
  const sortedResults = Array.from(fusedScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);

  if (sortedResults.length === 0) {
    return { context: 'No relevant document chunks found for this query.', chunks: [] };
  }

  // Build context string with source attribution
  let contextString = '';
  sortedResults.forEach((chunk, idx) => {
    contextString += `[Source ${idx + 1} (score: ${chunk.score.toFixed(3)})]: ${chunk.content}\n\n`;
  });

  return { context: contextString, chunks: sortedResults };
}

// Backward compatibility
export async function searchContentLegacy(
  embedding: number[],
  limit: number = 10
): Promise<string> {
  const result = await searchContent({ embedding, limit });
  return result.context;
}
