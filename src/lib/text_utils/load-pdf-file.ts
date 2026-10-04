import { execFile } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function loadPDF(uniqueName: string): Promise<string> {
  const filePath = join(process.cwd(), 'public', 'uploads', uniqueName);
  // pdftotext is a native binary, runs outside Node heap entirely
  const { stdout } = await execFileAsync('pdftotext', [filePath, '-']);
  return stdout.toString();
}
