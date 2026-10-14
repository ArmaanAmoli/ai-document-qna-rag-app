import { execFile } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface LoadPDFResult {
  text: string;
  pageCount: number;
}

export async function loadPDF(uniqueName: string): Promise<LoadPDFResult> {
  const filePath = join(process.cwd(), 'public', 'uploads', uniqueName);
  // Get page count using pdfinfo
  let pageCount = 0;
  try {
    const { stdout: infoOutput } = await execFileAsync('pdfinfo', [filePath]);
    const pageMatch = infoOutput.match(/Pages:\s+(\d+)/);
    if (pageMatch) {
      pageCount = parseInt(pageMatch[1], 10);
    }
  } catch {
    // pdfinfo not available, fallback to counting form feeds in pdftotext output
  }

  // pdftotext is a native binary, runs outside Node heap entirely
  const { stdout } = await execFileAsync('pdftotext', [filePath, '-']);
  const text = stdout.toString();
  
  // If pdfinfo failed, estimate page count from form feeds
  if (pageCount === 0) {
    pageCount = (text.match(/\f/g) || []).length + 1;
  }

  return { text, pageCount };
}