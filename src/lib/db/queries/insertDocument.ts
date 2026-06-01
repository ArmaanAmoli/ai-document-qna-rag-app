import { DocumentTS ,ChunkAndEmbedding} from '@/types';
import {prisma} from '../prisma'

async function insertDocument(document:DocumentTS , chunkAndEmbedding:ChunkAndEmbedding[]){
    return await prisma.$transaction(async(tx)=>{
        const sqlRows = chunkAndEmbedding.map((ce)=>{
            
        })
    })
}