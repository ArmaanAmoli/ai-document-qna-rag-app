-- Create HNSW index for vector similarity search on DocumentChunk.embedding
-- Requires pgvector extension with HNSW support
CREATE INDEX IF NOT EXISTS "document_chunk_embedding_idx" ON "DocumentChunk" 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create GIN index for full-text search on DocumentChunk.contentTsVector
CREATE INDEX IF NOT EXISTS "document_chunk_fts_idx" ON "DocumentChunk" 
USING GIN ("contentTsVector");

-- Create trigger function to automatically update contentTsVector when content changes
CREATE OR REPLACE FUNCTION update_content_tsvector()
RETURNS TRIGGER AS $func$
BEGIN
  NEW."contentTsVector" := to_tsvector('english', COALESCE(NEW."content", ''));
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "document_chunk_content_tsvector_update" ON "DocumentChunk";
CREATE TRIGGER "document_chunk_content_tsvector_update"
  BEFORE INSERT OR UPDATE ON "DocumentChunk"
  FOR EACH ROW EXECUTE FUNCTION update_content_tsvector();

-- Backfill existing contentTsVector values
UPDATE "DocumentChunk" SET "contentTsVector" = to_tsvector('english', COALESCE("content", ''));

-- Create partial index for active documents (tenant-aware)
CREATE INDEX IF NOT EXISTS "document_chunk_embedding_tenant_idx" ON "DocumentChunk" 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64)
WHERE "tenantId" IS NOT NULL;