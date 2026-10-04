import { prisma } from '../prisma';

export async function searchContent(embedding: number[], limit: number = 10): Promise<string> {
  const contextVector: string = `[${embedding.join(',')}]`;
  const chunks: { content: string }[] = await prisma.$queryRaw`
    SELECT content FROM "DocumentChunk" 
    ORDER BY embedding <=> ${contextVector}::vector
    LIMIT ${limit}`;

  if (chunks.length === 0) {
    return 'No relevant document chunks found for this query.';
  }

  let contextString: string = '';
  chunks.forEach(chunk => {
    contextString += chunk.content + ' ';
  });

  return contextString;
}
