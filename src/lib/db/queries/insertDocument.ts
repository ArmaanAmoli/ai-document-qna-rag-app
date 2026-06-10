import { DocumentTS, ChunkAndEmbedding } from '@/types';
import { prisma } from '../prisma'
import { Prisma } from '@/generated/prisma/client';
import { createId } from '@paralleldrive/cuid2';

export async function insertDocument(document: DocumentTS, chunkAndEmbedding: ChunkAndEmbedding[]) {
    return await prisma.$transaction(async (tx) => { // tx->transaction client
        const docRow = Prisma.sql`(
            ${document.id},
            ${document.name},
            ${document.type},
            ${document.size},
            NOW(),
            NOW()
        )`;

        // const sqlRows = chunkAndEmbedding.map((ce) => {
        //     const chunkID = createId();
        //     const vectorString = `[${ce.embedding.join(",")}]`;
        //     return Prisma.sql`(
        //         ${chunkID},
        //         ${document.id},
        //         ${ce.chunk.content},
        //         ${Prisma.raw(`'${`[${ce.embedding.join(",")}]`}'::vector`)},
        //         ${ce.chunk.index},
        //         NOW()
        //     )`
        // });

        await tx.$executeRaw`
        INSERT INTO "Document" ("id" , "name" , "type" , "size" , "createdAt" , "updatedAt") 
        VALUES ${docRow}`

        // await tx.$executeRaw`
        // INSERT INTO "DocumentChunk" ("id" , "documentId" , "content" , "embedding" , "chunkIndex" , "createdAt") 
        // VALUES ${Prisma.join(sqlRows)}
        // `
        for (const ce of chunkAndEmbedding) {
            const vectorString = `[${ce.embedding.join(",")}]`;

            await tx.$executeRawUnsafe(`
            INSERT INTO "DocumentChunk"
            ("id","documentId","content","embedding","chunkIndex","createdAt")
            VALUES (
            '${createId()}',
            '${document.id}',
            '${ce.chunk.content.replace(/'/g, "''")}',
            '${vectorString}'::vector,
            ${Math.floor(ce.chunk.index)},
            NOW()
            )
        `);
        }

    });
}