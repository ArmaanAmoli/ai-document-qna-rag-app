import { Chunk } from '@/types';

export function chunkText(text: string, maxLength = 500, overlap = 50): Chunk[] {
  console.log('chunking started');

  if (overlap >= maxLength) {
    throw new Error(`Overlap (${overlap}) must be less than maxLength (${maxLength})`);
  }

  const chunks: { content: string; index: number }[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = start + maxLength;
    if (end > text.length) {
      end = text.length;
    } else {
      // trying to break at a space to avoid cutting words
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start) end = lastSpace;
    }

    const content = text.substring(start, end).trim();
    if (content.length > 0) {
      chunks.push({ content, index });
      index++;
    }

    const nextStart = end - overlap;
    start = nextStart > start ? nextStart : end;
  }

  console.log('chunking done');
  return chunks;
}
