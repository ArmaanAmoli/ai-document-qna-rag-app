import { Message } from '@/types/chat.types';
import { prisma } from '../../prisma';
import { Prisma } from '@/generated/prisma/client';

export async function createNewMessage(message: Message) {
  const {
    id,
    content,
    index,
    chatId,
    isHuman,
    sourceChunkIds = [],
    sourceDocumentIds = [],
    retrievalScores = [],
    modelVersion = null,
    promptVersion = null,
    latencyMs = null,
    tokenUsage = null,
  } = message;

  const newMessage = Prisma.sql`(
    ${id},
    ${content},
    ${index},
    ${chatId},
    ${isHuman},
    ${sourceChunkIds},
    ${sourceDocumentIds},
    ${retrievalScores},
    ${modelVersion},
    ${promptVersion},
    ${latencyMs},
    ${tokenUsage}
  )`;

  return prisma.$transaction(async tx => {
    return tx.$executeRaw`INSERT INTO "Message" VALUES ${newMessage}`;
  });
}
