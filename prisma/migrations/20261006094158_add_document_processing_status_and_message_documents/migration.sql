-- DropIndex
DROP INDEX "document_chunk_embedding_idx";

-- DropIndex
DROP INDEX "document_chunk_fts_idx";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "charCount" INTEGER,
ADD COLUMN     "chunkCount" INTEGER,
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "pageCount" INTEGER,
ADD COLUMN     "processingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "processingStartedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "sourceDocumentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_chatId_status_idx" ON "Document"("chatId", "status");
