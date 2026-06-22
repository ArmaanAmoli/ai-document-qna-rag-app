import { execSync } from "child_process";
import { join } from "path";

export function loadPDF(uniqueName: string): string {
  const filePath = join(process.cwd(), "public", "uploads", uniqueName);
  // pdftotext is a native binary, runs outside Node heap entirely
  const text = execSync(`pdftotext "${filePath}" -`).toString();
  return text;
}
// const memoryData = process.memoryUsage();
// const maxRamUsed = memoryData.heapUsed / 1024 / 1024;

// console.log(`Peak JavaScript Heap Used: ${maxRamUsed.toFixed(2)} MB`);
// console.log(loadPDF("transformer.pdf"))