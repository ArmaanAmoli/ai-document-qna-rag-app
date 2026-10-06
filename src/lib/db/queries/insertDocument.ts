import { DocumentTS, ChunkAndEmbedding } from '@/types';
import { prisma } from '../prisma';
import { Prisma } from '@/generated/prisma/client';
import { createId } from '@paralleldrive/cuid2';

interface InsertDocumentOptions {
  document: DocumentTS;
  chunkAndEmbedding: ChunkAndEmbedding[];
  chatId: string;
  pageCount?: number;
  charCount?: number;
  chunkCount?: number;
  contentHash?: string;
  tenantId?: string;
  aclGroups?: string[];
}

export async function insertDocument(options: InsertDocumentOptions) {
  const {
    document,
    chunkAndEmbedding,
    chatId,
    pageCount,
    charCount,
    chunkCount,
    contentHash,
    tenantId,
    aclGroups = [],
  } = options;

  console.log('document insertion begin');
  return await prisma.$transaction(async tx => {
    const docRow = Prisma.sql`(
            ${document.id},
            ${document.name},
            ${document.type},
            ${document.size},
            NOW(),
            NOW(),
            ${chatId},
            ${tenantId ?? null},
            ${Prisma.join(aclGroups.map(g => Prisma.sql`${g}`))},
            ${pageCount ?? null},
            ${charCount ?? null},
            ${chunkCount ?? null},
            ${contentHash ?? null},
            'ready',
            NOW(),
            0,
            3
        )`;

    const sqlRows = chunkAndEmbedding.map(ce => {
      const chunkID = createId();
      // Use parameterized vector embedding - no string interpolation
      const vectorEmbedding = `[${ce.embedding.join(',')}]`;
      return Prisma.sql`(
                ${chunkID},
                ${document.id},
                ${ce.chunk.content},
                ${vectorEmbedding}::vector,
                ${ce.chunk.index},
                NOW(),
                ${tenantId ?? null},
                ${Prisma.join(aclGroups.map(g => Prisma.sql`${g}`))},
                NULL::tsvector
            )`;
    });

    await tx.$executeRaw`
        INSERT INTO "Document" 
          ("id", "name", "type", "size", "createdAt", "updatedAt", "chatId", 
           "tenantId", "aclGroups", "pageCount", "charCount", "chunkCount", 
           "contentHash", "status", "processingCompletedAt", "retryCount", "maxRetries")
        VALUES ${docRow}`;

    if (sqlRows.length > 0) {
      await tx.$executeRaw`
          INSERT INTO "DocumentChunk" 
            ("id", "documentId", "content", "embedding", "chunkIndex", "createdAt", 
             "tenantId", "aclGroups", "contentTsVector")
          VALUES ${Prisma.join(sqlRows)}
          `;
    }
  });
}
