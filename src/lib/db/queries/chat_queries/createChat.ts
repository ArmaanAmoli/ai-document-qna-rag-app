import { prisma } from "../../prisma";
import { Prisma } from "@/generated/prisma/client";

export async function createNewChat(chatId:string , userId:string){
    return(
    prisma.$transaction(async(tx)=>{
       return tx.$executeRaw`INSERT INTO "Chat" ("id","userId") VALUES (${chatId}, ${userId})`
    }));
}