import { prisma } from '../../prisma';

interface RawChatWithLatestMessage {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  latestMessageContent: string | null;
  latestMessageIsHuman: boolean | null;
  latestMessageCreatedAt: Date | null;
}

export interface ChatWithLatestMessage {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  latestMessage: {
    content: string;
    isHuman: boolean;
    createdAt: Date;
  } | null;
}

export async function fetchUserChats(userId: string): Promise<ChatWithLatestMessage[]> {
  const chats = (await prisma.$queryRaw`
    SELECT 
      c."id",
      c."userId",
      c."createdAt",
      c."updatedAt",
      m."content" as "latestMessageContent",
      m."isHuman" as "latestMessageIsHuman",
      m."createdAt" as "latestMessageCreatedAt"
    FROM "Chat" c
    LEFT JOIN LATERAL (
      SELECT "content", "isHuman", "createdAt"
      FROM "Message"
      WHERE "chatId" = c."id"
      ORDER BY "index" DESC
      LIMIT 1
    ) m ON true
    WHERE c."userId" = ${userId}
    ORDER BY c."updatedAt" DESC
  `) as RawChatWithLatestMessage[];

  return chats.map(chat => ({
    id: chat.id,
    userId: chat.userId,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    latestMessage: chat.latestMessageContent
      ? {
          content: chat.latestMessageContent,
          isHuman: chat.latestMessageIsHuman ?? false,
          createdAt: chat.latestMessageCreatedAt ?? new Date(),
        }
      : null,
  }));
}
