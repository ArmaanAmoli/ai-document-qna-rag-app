import { prisma } from "../prisma";

export async function searchContent(documentId:string, embedding:number[]):Promise<string>{
    const contextVector:string = `[${embedding.join(',')}]`;
    const chunks:{content:string}[] = await prisma.$queryRaw`
    SELECT content FROM DocumentChunk 
    WHERE documentId=${documentId} 
    ORDER BY embedding <=> ${contextVector}::vector`;

    let contextString:string = "";
    chunks.forEach((chunk)=>{
        contextString += (chunk.content + " ");
    });

    return contextString;
}