import { prisma } from '../../prisma';
import { Message } from '@/types/chat.types';

interface MessageRow {
  id: string;
  content: string;
  index: number;
  chatId: string;
  isHuman: boolean;
}

export async function fetchChatMessages(chatId: string, userId?: string): Promise<Message[]> {
  if (userId) {
    // Verify chat belongs to user
    const chat = await prisma.$queryRaw<{ userId: string }[]>`
            SELECT "userId" FROM "Chat" WHERE "id" = ${chatId}
        `;

    if (chat.length === 0 || chat[0].userId !== userId) {
      throw new Error('Chat not found or access denied');
    }
  }

  const messages = await prisma.$queryRaw<MessageRow[]>`
        SELECT "id", "content", "index", "chatId", "isHuman"
        FROM "Message"
        WHERE "chatId" = ${chatId}
        ORDER BY "index" ASC
    `;

  return messages.map(m => ({
    id: m.id,
    content: m.content,
    index: m.index,
    chatId: m.chatId,
    isHuman: m.isHuman,
  }));
}
