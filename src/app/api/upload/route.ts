import { writeFile , mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join, extname, basename } from "path";
import { extractText } from "@/lib/extract-text";
import { PDFData } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        //renaming file to a unique name
        const fileExtension = extname(file.name); // .pdf or .txt
        const fileBaseName = basename(file.name, fileExtension);
        const uniqueName = `${fileBaseName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${fileExtension}`;

        //Converting file data into a Node.js Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // directory
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure the folder exists
        await mkdir(uploadDir, { recursive: true });

        // final file path
        const filePath = join(uploadDir, uniqueName);
        
        // writing file to disk
        await writeFile(filePath, buffer);

        const extractedText:string|PDFData = await extractText(uniqueName);
        
        console.log(`Extracted Text: ${extractedText}`);

        return NextResponse.json({ success: true, message: `File saved successfully received` })
    } catch (error) {
        console.log(`file saving failed: `, error);
        return NextResponse.json({ error: 'Server error saving file' }, { status: 500 });
    }
}