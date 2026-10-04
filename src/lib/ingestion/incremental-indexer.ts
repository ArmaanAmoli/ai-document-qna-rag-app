import { prisma } from '@/lib/db/prisma';
import { createId } from '@paralleldrive/cuid2';
import { chunkText } from '@/lib/text_utils/chunk-text';
import { generateEmbedding } from '@/lib/text_utils/embedding';
import { insertDocument } from '@/lib/db/queries/insertDocument';
import { Chunk, ChunkAndEmbedding, DocumentTS } from '@/types';
import { createHash } from 'crypto';

/**
 * Incremental Indexing Service
 *
 * Detects document changes using content hashing and only re-processes
 * modified documents. Handles inserts, updates, and deletes.
 */

export interface IndexingResult {
  documentId: string;
  action: 'inserted' | 'updated' | 'deleted' | 'unchanged';
  chunksProcessed: number;
  error?: string;
}

export interface DocumentToIndex {
  id?: string; // If not provided, will be generated
  name: string;
  type: string;
  size: number;
  content: string;
  chatId: string;
  tenantId?: string;
  aclGroups?: string[];
  sourceModifiedAt?: Date;
  metadata?: Record<string, unknown>;
}

// Compute content hash for change detection
export function computeContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

// Check if document needs reindexing
export async function needsReindexing(
  documentId: string,
  newContentHash: string
): Promise<boolean> {
  const existing = await prisma.document.findUnique({
    where: { id: documentId },
    select: { contentHash: true },
  });

  if (!existing) return true; // New document
  return existing.contentHash !== newContentHash;
}

// Process a single document (insert or update)
export async function processDocument(doc: DocumentToIndex): Promise<IndexingResult> {
  const contentHash = computeContentHash(doc.content);
  const documentId = doc.id || createId();

  try {
    // Check if document exists and needs update
    const existing = await prisma.document.findUnique({
      where: { id: documentId },
      select: { contentHash: true, id: true },
    });

    if (existing) {
      if (existing.contentHash === contentHash) {
        return {
          documentId,
          action: 'unchanged',
          chunksProcessed: 0,
        };
      }
      // Document changed - delete old chunks and re-process
      await prisma.documentChunk.deleteMany({
        where: { documentId },
      });
    }

    // Chunk the document
    const chunks: Chunk[] = chunkText(doc.content, 500, 50); // Use configured chunk size
    const chunkTexts: string[] = chunks.map(c => c.content);

    // Generate embeddings
    const embeddings = await generateEmbedding(chunkTexts);

    const chunkAndEmbeddings: ChunkAndEmbedding[] = embeddings.map((embedding, index) => ({
      chunk: { ...chunks[index], index },
      embedding,
    }));

    // Prepare document for insertion
    const document: DocumentTS = {
      id: documentId,
      name: doc.name,
      type: doc.type,
      size: doc.size,
    };

    // Insert document and chunks
    await insertDocument(document, chunkAndEmbeddings, doc.chatId);

    // Update document with metadata
    await prisma.document.update({
      where: { id: documentId },
      data: {
        contentHash,
        tenantId: doc.tenantId,
        aclGroups: doc.aclGroups || [],
        sourceModifiedAt: doc.sourceModifiedAt || new Date(),
        embeddingVersion: process.env.EMBEDDING_MODEL_VERSION || 'all-MiniLM-L6-v2',
      },
    });

    return {
      documentId,
      action: existing ? 'updated' : 'inserted',
      chunksProcessed: chunks.length,
    };
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    return {
      documentId,
      action: 'inserted', // Will be treated as error
      chunksProcessed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Soft delete: mark document as deleted (tombstone)
export async function softDeleteDocument(documentId: string): Promise<void> {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      // Add a deletedAt timestamp for tombstone filtering
      // Note: This requires adding deletedAt field to schema
      // For now, we'll use a different approach
    },
  });

  // For now, actually delete chunks but keep document record with marker
  await prisma.documentChunk.deleteMany({
    where: { documentId },
  });

  // Mark document as deleted by setting a special flag in metadata
  // This requires a deletedAt field in schema
}

// Hard delete: completely remove document and chunks
export async function hardDeleteDocument(documentId: string): Promise<void> {
  await prisma.$transaction(async tx => {
    await tx.documentChunk.deleteMany({ where: { documentId } });
    await tx.document.delete({ where: { id: documentId } });
  });
}

// Batch process multiple documents
export async function batchProcessDocuments(
  documents: DocumentToIndex[]
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  for (const doc of documents) {
    const result = await processDocument(doc);
    results.push(result);

    // Log progress
    if (result.error) {
      console.error(`Failed to process ${doc.name}:`, result.error);
    } else {
      console.log(`Processed ${doc.name}: ${result.action} (${result.chunksProcessed} chunks)`);
    }
  }

  return results;
}

// Reconciliation: find documents that need updating by comparing source
// This is for scheduled crawls to catch missed events
export async function reconcileDocuments(
  chatId: string,
  sourceDocuments: Array<{ id: string; content: string; metadata: DocumentToIndex }>
): Promise<{ processed: number; deleted: number }> {
  const existingDocs = await prisma.document.findMany({
    where: { chatId },
    select: { id: true, contentHash: true, name: true },
  });

  const existingMap = new Map(existingDocs.map(d => [d.id, d]));
  const sourceIds = new Set(sourceDocuments.map(d => d.id));

  let processed = 0;
  let deleted = 0;

  // Process new/updated documents
  for (const sourceDoc of sourceDocuments) {
    const existing = existingMap.get(sourceDoc.id);
    const contentHash = computeContentHash(sourceDoc.content);

    if (!existing || existing.contentHash !== contentHash) {
      await processDocument({
        id: sourceDoc.id,
        ...sourceDoc.metadata,
        content: sourceDoc.content,
        chatId,
      });
      processed++;
    }
  }

  // Handle deleted documents (in source but not in DB, or in DB but not in source)
  for (const [id, existing] of existingMap) {
    if (!sourceIds.has(id)) {
      await hardDeleteDocument(id);
      deleted++;
    }
  }

  return { processed, deleted };
}

// Get indexing statistics
export async function getIndexingStats(chatId?: string, tenantId?: string) {
  const where: Record<string, unknown> = {};
  if (chatId) where.chatId = chatId;
  if (tenantId) where.tenantId = tenantId;

  const [docCount, chunkCount] = await Promise.all([
    prisma.document.count({ where }),
    prisma.documentChunk.count({
      where: chatId ? { document: { chatId } } : tenantId ? { tenantId } : {},
    }),
  ]);

  // Calculate avg chunks per doc manually
  let avgChunksPerDoc = 0;
  if (docCount > 0) {
    avgChunksPerDoc = chunkCount / docCount;
  }

  return {
    documentCount: docCount,
    chunkCount,
    avgChunksPerDoc,
    embeddingVersion: process.env.EMBEDDING_MODEL_VERSION || 'all-MiniLM-L6-v2',
  };
}
