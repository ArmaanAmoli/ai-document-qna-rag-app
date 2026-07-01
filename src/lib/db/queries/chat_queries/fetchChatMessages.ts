import { Prisma } from "@/generated/prisma/client";
import {prisma} from "../../prisma"
import { Message } from "@/types/chat.types";

export async function fetchChatMessages(chatId:string):Promise<Message[]>{
    let message = await prisma.$queryRaw`
    SELECT * FROM "Message" 
    WHERE "chatId"=${chatId} 
    ORDER BY "index" ASC` as Message[];
    return message;
}