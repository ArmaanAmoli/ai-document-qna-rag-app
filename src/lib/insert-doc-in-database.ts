import { chunkText } from "./chunk-text";
import { generateEmbedding } from "./embedding";
import {prisma} from './db/prisma'
import { createId } from "@paralleldrive/cuid2";
import { Chunk , ChunkAndEmbedding , DocumentChunkTS , DocumentTS} from "@/types";

export async function insertDocInDatabase(text:string , filename:string , filetype:string,
    filesize:number){

        /*
        create chunks of the document
        perform embedding on those chunks
        store the document in the Document table via a raw query
        store each document chunk in the DocumentChunk table via a raw query
        */
       const documentID = createId();

        const AllChunksAndEmbedding:ChunkAndEmbedding[]=[];

        //Chunking;
        const chunks:Chunk[] =  chunkText(text , 400 , 50);

        //Embedding on each chunk
        chunks.forEach(async(chunk)=>{
            const embedding = await generateEmbedding(chunk.content);
            AllChunksAndEmbedding.push({chunk:chunk , embedding:embedding});
        })

        // Creating DocumentTS object;
        const document:DocumentTS = {
            id:documentID,
            name:filename,
            type:filetype,
            size:filesize,
        }

        
        //DocumentChunkTS






    }
