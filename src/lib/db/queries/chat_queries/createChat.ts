import { prisma } from '../../prisma';

export async function createNewChat(chatId: string, userId: string, title?: string) {
  return prisma.$transaction(async tx => {
    return tx.$executeRaw`INSERT INTO "Chat" ("id","userId", "title") VALUES (${chatId}, ${userId}, ${title ?? null})`;
  });
}

export async function updateChatTitle(chatId: string, userId: string, title: string) {
  return prisma.$transaction(async tx => {
    const result = await tx.$executeRaw`
      UPDATE "Chat" SET "title" = ${title}, "updatedAt" = NOW() WHERE "id" = ${chatId} AND "userId" = ${userId}
    `;
    return result;
  });
}

export async function deleteChat(chatId: string, userId: string) {
  return prisma.$transaction(async tx => {
    // Messages and documents will be cascade deleted due to schema relations
    return tx.$executeRaw`DELETE FROM "Chat" WHERE "id" = ${chatId} AND "userId" = ${userId}`;
  });
}
