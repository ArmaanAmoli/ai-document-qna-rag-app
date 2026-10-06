import { chunkText } from './chunk-text';
import { generateEmbedding } from './embedding';
import { createId } from '@paralleldrive/cuid2';
import { Chunk, ChunkAndEmbedding, DocumentTS } from '@/types';
import { insertDocument } from '../db/queries/insertDocument';
import { calculateFileHash } from '@/lib/file_utils/validation';

interface InsertDocOptions {
  text: string;
  filename: string;
  filetype: string;
  filesize: number;
  chatId: string;
  buffer?: Buffer;
  pageCount?: number;
  tenantId?: string;
  aclGroups?: string[];
}

export async function insertDocInDatabase(options: InsertDocOptions): Promise<string> {
  const {
    text,
    filename,
    filetype,
    filesize,
    chatId,
    buffer,
    pageCount,
    tenantId,
    aclGroups = [],
  } = options;

  console.log('Insertion in to db started');

  const documentID = createId();

  // Chunking
  const chunks: Chunk[] = chunkText(text, 400, 50);
  const chunkTextArray: string[] = chunks.map(value => value.content);

  const embededArray: number[][] = await generateEmbedding(chunkTextArray);

  const allChunksAndEmbedding: ChunkAndEmbedding[] = embededArray.map((value, index) => ({
    chunk: chunks[index],
    embedding: value,
  }));

  console.log('all chunks embedded');

  // Calculate content hash if buffer provided
  let contentHash: string | undefined;
  if (buffer) {
    contentHash = await calculateFileHash(buffer);
  }

  // Creating DocumentTS object
  const document: DocumentTS = {
    id: documentID,
    name: filename,
    type: filetype,
    size: filesize,
  };

  try {
    await insertDocument({
      document,
      chunkAndEmbedding: allChunksAndEmbedding,
      chatId,
      pageCount,
      charCount: text.length,
      chunkCount: chunks.length,
      contentHash,
      tenantId,
      aclGroups,
    });
    console.log('document inserted');
  } catch (error) {
    throw error;
  }
  return documentID;
}
