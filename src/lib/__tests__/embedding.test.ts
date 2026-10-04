import { test, expect } from 'vitest';
import { generateEmbedding } from '../text_utils/embedding';

test('The model returns embeddings array with correct dimensions', async () => {
  const ans = await generateEmbedding(['This is a sample text']);
  expect(Array.isArray(ans)).toBe(true);
  expect(ans.length).toBe(1); // One embedding per input text
  expect(Array.isArray(ans[0])).toBe(true);
  expect(ans[0].length).toBe(384); // 384-dimensional embedding
});
