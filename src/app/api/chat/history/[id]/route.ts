import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/chat.types";
import { fetchChatMessages } from "@/lib/db/queries/chat_queries/fetchChatMessages";
export async function GET(request: NextRequest , {params}:{params:Promise<{id:string}>}) {
    try {
        const chatId = (await params).id;
        const messageHistroy:Message[] = await fetchChatMessages(chatId);
        console.log("Message history function backend : ",messageHistroy);
        return NextResponse.json({ "messages": messageHistroy }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({"error" : `server error: ${error}`} , {status:500});
    }
}