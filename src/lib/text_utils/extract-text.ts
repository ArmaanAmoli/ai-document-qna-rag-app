import { readFile } from "fs/promises";
import { extname, basename } from "path";
import { loadTextFile } from "./load-text-file";
import { loadPDF } from "./load-pdf-file";
import { PDFData } from "@/types";

export async function extractText(uniqueName: string): Promise<string> {
    try {
        const fileExtension = extname(uniqueName);
        if (fileExtension === ".txt") {
            const data: string = await loadTextFile(uniqueName);
            return data;
        }
        else if (fileExtension === ".pdf") {
            const data: string = loadPDF(uniqueName);
            return data;
        }
        else {
            throw new Error("Only .pdf and .txt files are supported");
        }
    } catch (error) {
        throw (error);
    }
}