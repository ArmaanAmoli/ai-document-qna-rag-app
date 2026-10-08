import { prisma } from '../../prisma';
import { Message } from '@/types/chat.types';

interface MessageRow {
  id: string;
  content: string;
  index: number;
  chatId: string;
  isHuman: boolean;
  sourceChunkIds: string[];
  sourceDocumentIds: string[];
  retrievalScores: number[];
  modelVersion: string | null;
  promptVersion: string | null;
  latencyMs: number | null;
  tokenUsage: Record<string, unknown> | null;
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
        SELECT "id", "content", "index", "chatId", "isHuman",
               "sourceChunkIds", "sourceDocumentIds", "retrievalScores",
               "modelVersion", "promptVersion", "latencyMs", "tokenUsage"
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
    sourceChunkIds: m.sourceChunkIds || [],
    sourceDocumentIds: m.sourceDocumentIds || [],
    retrievalScores: m.retrievalScores || [],
    modelVersion: m.modelVersion || undefined,
    promptVersion: m.promptVersion || undefined,
    latencyMs: m.latencyMs || undefined,
    tokenUsage: m.tokenUsage || undefined,
  }));
}
