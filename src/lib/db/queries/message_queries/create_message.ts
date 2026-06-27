import { Message } from "@/types/chat.types"
import {prisma} from "../../prisma"
import { Prisma } from "@/generated/prisma/client"

export async function createNewMessage(message:Message){
    const {id , content , index , chatId , isHuman} = message
    const newMessage = Prisma.sql`(${id} , ${content} , ${index} , ${chatId} , ${isHuman})`;
    return(
        prisma.$transaction(async(tx)=>{
            tx.$executeRaw`
            INSERT INTO "Message" VALUES`
        })
    )
}