import { DocumentChunk , Document } from "@/generated/prisma/client";

interface PDFData{
    text:string;            // The Extracted raw text
    numpages:number;        // no . pages in original file
    numrendered: number;    // no . paged processed successfully
    info:any;               // Document metadata (Author etc)
    metadata:any;           // XML-based Metadata
    version?:string ;         // PDF version format
}

interface DocumentChunkTS extends DocumentChunk{ embedding:number; }

interface DocumentTS {
    name: string;
    id: string;
    type: string;
    size: number;
    createdAt? : Date;
    updatedAt? : Date;
}

interface Chunk { content:string ; index:number };

interface ChunkAndEmbedding{ chunk:Chunk; embedding:number[] };

export type { PDFData , DocumentChunkTS , DocumentTS , Chunk , ChunkAndEmbedding};