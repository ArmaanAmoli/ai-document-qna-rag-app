// import { readFile } from "fs/promises";
// import { PDFParse } from "pdf-parse"
// import { PDFData } from "@/types";
// import { join } from "path";
// import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs"

// export async function loadPDF(uniqueName: string): Promise<PDFData> {
//     try {
//         const uploadDir = join(process.cwd(), 'public', 'uploads');
//         const filePath = join(uploadDir, uniqueName);

//         const dataBuffer: Buffer = await readFile(filePath);
//         const uint8ArrayData = new Uint8Array(dataBuffer);

//         const parser = new PDFParse(uint8ArrayData);
//         const infoPayload = await parser.getInfo();
//         const textPayload = await parser.getText();

//         return {
//             text: textPayload.text,
//             numpages: Number(infoPayload.pages),
//             numrendered: Number(infoPayload.pages),
//             info: infoPayload.info,
//             metadata: infoPayload.metadata || null,
//         }
//     } catch (error) {
//         throw new Error(`An error occurred while parsing pdf: ${error}`)
//     }

// }

// import { readFile } from "fs/promises";
// import { join } from "path";
// import { PDFData } from "@/types";

// // 1. Import the legacy server-ready build
// import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

// // 2. Safely configure the local Node-compatible worker path
// // This maps directly to the external server package file path
// pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

// export async function loadPDF(uniqueName: string): Promise<PDFData> {
//     try {
//         const uploadDir = join(process.cwd(), 'public', 'uploads');
//         const filePath = join(uploadDir, uniqueName);
        
//         // Read file into a raw Buffer stream
//         const dataBuffer: Buffer = await readFile(filePath);
//         const uint8ArrayData = new Uint8Array(dataBuffer);

//         // 3. Document parameters are kept perfectly clean for TypeScript
//         const loadingTask = pdfjs.getDocument({
//             data: uint8ArrayData,
//             useWorkerFetch: false
//         });
        
//         const pdfDocument = await loadingTask.promise;
//         const totalPages = pdfDocument.numPages;
        
//         // 4. Sequentially append page strings to safe-guard memory
//         let extractedText = "";
//         for (let i = 1; i <= totalPages; i++) {
//             const page = await pdfDocument.getPage(i);
//             const textContent = await page.getTextContent();
//             const pageText = textContent.items
//                 .map((item: any) => item.str)
//                 .join(" ");
//             extractedText += pageText + "\n";
//         }

//         // Extract metadata safely without crashing if empty
//         const metadataPayload = await pdfDocument.getMetadata().catch(() => null);

//         return {
//             text: extractedText.trim(),
//             numpages: totalPages,
//             numrendered: totalPages,
//             info: metadataPayload?.info || {},
//             metadata: metadataPayload?.metadata || null,
//         };
//     } catch (error) {
//         throw new Error(`An error occurred while parsing pdf: ${error}`);
//     }
// }


import { PDFData } from "@/types";
import { getDocumentProxy } from "unpdf";
import { readFileSync } from "fs";


// export async function loadPDF(uniqueName: string): Promise<PDFData> {

// }