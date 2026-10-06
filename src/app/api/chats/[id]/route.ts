import { NextRequest, NextResponse } from 'next/server';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { updateChatTitle, deleteChat } from '@/lib/db/queries/chat_queries/createChat';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const chatId = (await params).id;
    const user = getUserInfoFromCookies(request);
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 });
    }

    await updateChatTitle(chatId, user.id, title.trim());

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Update chat title error:', error);
    return NextResponse.json({ error: 'Failed to update chat title' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const chatId = (await params).id;
    const user = getUserInfoFromCookies(request);

    await deleteChat(chatId, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
