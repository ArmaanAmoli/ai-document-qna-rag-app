import { prisma } from "../../prisma";
import { Prisma } from "@/generated/prisma/client";

export async function createNewChat(chatId:string , userId:string){
    const newChat = Prisma.sql`(${chatId} , ${userId})`;
    return(
    prisma.$transaction(async(tx)=>{
        tx.$executeRaw`
        INSERT INTO "Chat" VALUES ${newChat};
        `
    }));
}