import { NextRequest, NextResponse } from 'next/server';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { prisma } from '@/lib/db/prisma';
import { join } from 'path';
import { existsSync } from 'fs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

// GET - Download document
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const documentId = (await params).id;
    const user = getUserInfoFromCookies(request);

    // Verify user owns this document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        chat: { userId: user.id },
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        chatId: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Try to find the file in uploads directory
    // Note: In production, you'd store the file path in the document record
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    // Find file matching this document (by name pattern)
    // This is a simplified approach - in production, store the actual file path
    return NextResponse.json(
      { error: 'File download not fully implemented - file storage path not tracked' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 });
  }
}

// PATCH - Rename document
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const documentId = (await params).id;
    const user = getUserInfoFromCookies(request);
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (name.length > 255) {
      return NextResponse.json({ error: 'Name must be 255 characters or less' }, { status: 400 });
    }

    // Verify user owns this document and update
    const document = await prisma.document.findFirst({
      where: { id: documentId, chat: { userId: user.id } },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { name: name.trim(), updatedAt: new Date() },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ document: updated }, { status: 200 });
  } catch (error) {
    console.error('Document rename error:', error);
    return NextResponse.json({ error: 'Failed to rename document' }, { status: 500 });
  }
}

// POST - Retry document processing
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const documentId = (await params).id;
    const user = getUserInfoFromCookies(request);

    // Verify user owns this document
    const document = await prisma.document.findFirst({
      where: { id: documentId, chat: { userId: user.id } },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Check if document can be retried
    if (document.status === 'ready') {
      return NextResponse.json({ error: 'Document is already processed' }, { status: 400 });
    }

    if (document.retryCount >= document.maxRetries) {
      return NextResponse.json({ error: 'Maximum retry attempts exceeded' }, { status: 400 });
    }

    // Reset status to pending for retry
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'pending',
        retryCount: { increment: 1 },
        processingError: null,
        processingStartedAt: null,
        processingCompletedAt: null,
      },
    });

    // In a real implementation, you'd queue the processing job here
    // For now, we just return success and the frontend can re-upload
    return NextResponse.json(
      { message: 'Document queued for reprocessing. Please re-upload the file.', retryable: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Document retry error:', error);
    return NextResponse.json({ error: 'Failed to retry document processing' }, { status: 500 });
  }
}

// DELETE - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const documentId = (await params).id;
    const user = getUserInfoFromCookies(request);

    // Verify user owns this document
    const document = await prisma.document.findFirst({
      where: { id: documentId, chat: { userId: user.id } },
      select: { id: true, chatId: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Delete document (cascades to chunks via schema)
    await prisma.document.delete({ where: { id: documentId } });

    return NextResponse.json(
      { success: true, message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
