import { extname } from 'path';
import { loadTextFile } from './load-text-file';
import { loadPDF, LoadPDFResult } from './load-pdf-file';

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
      const data: LoadPDFResult = await loadPDF(uniqueName);
      return { text: data.text, pageCount: data.pageCount };
    } else {
      throw new Error('Only .pdf, .txt, and .md files are supported');
    }
  } catch (error) {
    throw error;
  }
}