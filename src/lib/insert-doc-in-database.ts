import { chunkText } from "./chunk-text";
import { generateEmbedding } from "./embedding";
import { prisma } from './db/prisma'
import { createId } from "@paralleldrive/cuid2";
import { Chunk, ChunkAndEmbedding, DocumentChunkTS, DocumentTS } from "@/types";
import { insertDocument } from "./db/queries/insertDocument";

export async function insertDocInDatabase(text: string, filename: string, filetype: string,
    filesize: number): Promise<string> {

    console.log("Insertion in to db started");

    /*
    create chunks of the document
    perform embedding on those chunks
    store the document in the Document table via a raw query
    store each document chunk in the DocumentChunk table via a raw query
    */
    const documentID = createId();


    //Chunking;

    const chunks: Chunk[] = chunkText(text, 400, 50);
    const chunkTextArray:string[] = chunks.map((value , index)=>{
        const text:string = value.content;
        return text;
    });

    const embededArray:number[][] = await generateEmbedding(chunkTextArray);

    const AllChunksAndEmbedding: ChunkAndEmbedding[] = embededArray.map((value , index)=>{
        return {
            chunk:chunks[index],
            embedding:value
        };
    });

    //Embedding on each chunk
    // chunks.forEach(async (chunk) => {
    //     const embedding = await generateEmbedding(chunk.content);
    //     AllChunksAndEmbedding.push({ chunk: chunk, embedding: embedding });
    // });

    console.log("all chunks embedded")

    // Creating DocumentTS object;
    const document: DocumentTS = {
        id: documentID,
        name: filename,
        type: filetype,
        size: filesize,
    }
    try {
        await insertDocument(document, AllChunksAndEmbedding);
    }
    catch (error) {
        throw new Error(`Document insertion failed in database ${error}`)
    }
    return documentID;
}
