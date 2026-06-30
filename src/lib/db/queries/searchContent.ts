import { prisma } from "../prisma";

export async function searchContent(embedding:number[]):Promise<string>{
    const contextVector:string = `[${embedding.join(',')}]`;
    const chunks:{content:string}[] = await prisma.$queryRaw`
    SELECT content FROM "DocumentChunk" 
    ORDER BY embedding <=> ${contextVector}::vector
    LIMIT 10`;

    let contextString:string = "";
    chunks.forEach((chunk)=>{
        contextString += (chunk.content + " ");
    });

    return contextString;
}