import { extname } from 'path';
import { loadTextFile } from './load-text-file';
import { loadPDF } from './load-pdf-file';

export interface ExtractResult {
  text: string;
  pageCount?: number;
}

export async function extractText(uniqueName: string): Promise<ExtractResult> {
  try {
    const fileExtension = extname(uniqueName).toLowerCase();
    if (fileExtension === '.txt' || fileExtension === '.md') {
      const data: string = await loadTextFile(uniqueName);
      return { text: data };
    } else if (fileExtension === '.pdf') {
      const data = await loadPDF(uniqueName);
      // loadPDF returns string, but we need to get page count from the PDF
      // For now, return the text and we'll need to enhance loadPDF to return page count
      return { text: data, pageCount: undefined };
    } else {
      throw new Error('Only .pdf, .txt, and .md files are supported');
    }
  } catch (error) {
    throw error;
  }
}
