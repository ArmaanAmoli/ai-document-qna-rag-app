import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse"
import { PDFData } from "@/types";
import { join } from "path";

export async function loadPDF(uniqueName: string): Promise<PDFData> {
    try{
        const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, uniqueName);
    const dataBuffer: Buffer = await readFile(filePath);
    const unit8ArrayData = new Uint8Array(dataBuffer);
    const parser = new PDFParse(unit8ArrayData);
    const infoPayload = await parser.getInfo();
    const textPayload = await parser.getText();

    return {
        text: textPayload.text,
        numpages: Number(infoPayload.pages),
        numrendered: Number(infoPayload.pages),
        info: infoPayload.info,
        metadata: infoPayload.metadata || null,
    }
    }catch(error){
        throw new Error(`An error occured while parsing pdf: ${error}`)
    }

}