import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/chat.types";
import { fetchChatMessages } from "@/lib/db/queries/chat_queries/fetchChatMessages";
export async function GET(request: NextRequest) {
    try {
        const data = await request.json();
        if (data === null || data === undefined || data.chatId === undefined || data.chatId === null) {
            return NextResponse.json({ error: "chatId not provided" }, { status: 400 });
        }
        const chatId = data.chatId;
        const messageHistroy:Message[] = await fetchChatMessages(chatId);
        return NextResponse.json({ "messages": messageHistroy }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({"error" : `server error: ${error}`} , {status:500});
    }
}