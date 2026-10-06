import { NextRequest, NextResponse } from 'next/server';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const chatId = (await params).id;
    const user = getUserInfoFromCookies(request);

    // Verify user owns this chat
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: user.id },
      select: { id: true },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 });
    }

    // Fetch documents for this chat
    const documents = await prisma.document.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        status: true,
        pageCount: true,
        charCount: true,
        chunkCount: true,
        processingError: true,
        createdAt: true,
        updatedAt: true,
        processingCompletedAt: true,
        retryCount: true,
        maxRetries: true,
      },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
