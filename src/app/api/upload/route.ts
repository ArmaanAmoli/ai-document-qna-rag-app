import { writeFile , mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join, extname, basename } from "path";
import { extractText } from "@/lib/extract-text";
import { PDFData } from "@/types";
import { createId } from "@paralleldrive/cuid2";
import { insertDocInDatabase } from "@/lib/insert-doc-in-database";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        //renaming file to a unique name
        const documentId:string = createId();
        const fileExtension:string = extname(file.name); // .pdf or .txt
        const fileBaseName:string = basename(file.name, fileExtension);
        const uniqueName:string = `${fileBaseName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${fileExtension}`;

        //Converting file data into a Node.js Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filesize = buffer.length/(1024*1024);

        // directory
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure the folder exists
        await mkdir(uploadDir, { recursive: true });

        // final file path
        const filePath = join(uploadDir, uniqueName);
        
        // writing file to disk
        await writeFile(filePath, buffer);

        // extracting data from file
        const extractedData:string|PDFData = await extractText(uniqueName);

        // // breaking text into small chunks
        let extractedText = extractedData;

        console.log("text extracted successfully")

        try{
            const docId = await insertDocInDatabase(extractedText , fileBaseName , fileExtension , filesize)
            return NextResponse.json({ success: true, message: `File saved successfully received` , documentId: docId});

        }
        catch(error){
            throw error;
        }

    } catch (error) {
        console.log(`file saving failed: `, error);
        return NextResponse.json({ error: 'Server error saving file' }, { status: 500 });
    }
}