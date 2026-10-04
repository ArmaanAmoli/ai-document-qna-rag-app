import { NextRequest, NextResponse } from 'next/server';
import { fetchUserChats } from '@/lib/db/queries/chat_queries/fetchUserChats';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';

export async function GET(request: NextRequest) {
  try {
    const user = getUserInfoFromCookies(request);
    const userChats = await fetchUserChats(user.id);
    return NextResponse.json({ chats: userChats }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: `server error: ${error}` }, { status: 500 });
  }
}
