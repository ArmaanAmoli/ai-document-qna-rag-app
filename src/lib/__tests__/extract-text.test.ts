import { describe, expect, it } from 'vitest';
import { extractText } from '../text_utils/extract-text';

describe('Text extraction test from pdf and text files', () => {
  it('.txt extractor test', async () => {
    const result = await extractText('sampleTXT.txt');
    expect(result.text).toBe('This is a sample text');
  });

  it('.pdf extractor test', async () => {
    const result = await extractText('samplePDF.pdf');
    expect(result.text).toContain('This is a sample text');
  });

  it('testing other file types (should throw error)', async () => {
    await expect(extractText('sampleDOC.doc')).rejects.toThrow(
      'Only .pdf, .txt, and .md files are supported'
    );
  });
});
