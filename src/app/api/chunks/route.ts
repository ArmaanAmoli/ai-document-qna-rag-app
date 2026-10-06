import { NextRequest, NextResponse } from 'next/server';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma/client';

// GET - Fetch chunks by IDs
export async function GET(request: NextRequest) {
  try {
    const user = getUserInfoFromCookies(request);
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ error: 'ids parameter required' }, { status: 400 });
    }

    const chunkIds = idsParam.split(',').filter(Boolean);
    if (chunkIds.length === 0) {
      return NextResponse.json({ chunks: [] }, { status: 200 });
    }

    // Fetch chunks with document info, ensuring user has access via ACL
    const chunks = await prisma.$queryRaw`
      SELECT 
        dc."id",
        dc."content",
        d."name" as "documentName"
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d."id"
      JOIN "Chat" c ON d."chatId" = c."id"
      WHERE dc."id" IN (${Prisma.join(chunkIds.map(id => Prisma.sql`${id}`))})
        AND c."userId" = ${user.id}
    `;

    return NextResponse.json({ chunks }, { status: 200 });
  } catch (error) {
    console.error('Fetch chunks error:', error);
    return NextResponse.json({ error: 'Failed to fetch chunks' }, { status: 500 });
  }
}
