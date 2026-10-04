import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/types/chat.types';
import { fetchChatMessages } from '@/lib/db/queries/chat_queries/fetchChatMessages';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const chatId = (await params).id;
    const user = getUserInfoFromCookies(request);
    const messageHistory: Message[] = await fetchChatMessages(chatId, user.id);
    console.log('Message history function backend: ', messageHistory);
    return NextResponse.json({ messages: messageHistory }, { status: 200 });
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const status = errorMessage.includes('access denied') ? 403 : 500;
    return NextResponse.json({ error: `server error: ${errorMessage}` }, { status });
  }
}
