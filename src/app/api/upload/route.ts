import { writeFile, mkdir, unlink } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join, extname, basename } from 'path';
import { extractText } from '@/lib/text_utils/extract-text';
import { insertDocInDatabase } from '@/lib/text_utils/insert-doc-in-database';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { createNewChat } from '@/lib/db/queries/chat_queries/createChat';
import { createNewMessage } from '@/lib/db/queries/message_queries/create_message';
import { Message } from '@/types/chat.types';
import { fetchChatMessages } from '@/lib/db/queries/chat_queries/fetchChatMessages';
import {
  validateFileType,
  validateFileSize,
  generateStorageKey,
  calculateFileHash,
} from '@/lib/file_utils/validation';
import { createId } from '@paralleldrive/cuid2';
import { uploadLimiter } from '@/lib/rate-limit';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await uploadLimiter(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // gather user info from cookies
    const userInfo = getUserInfoFromCookies(req);

    const clientURL = req.headers.get('referer');
    if (clientURL === null) {
      return NextResponse.json({ error: 'No referer passed' }, { status: 400 });
    }
    const clientUrlPath = new URL(clientURL).pathname;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      return NextResponse.json({ error: typeValidation.error }, { status: 400 });
    }

    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // Generate storage key
    const uniqueName = generateStorageKey(file.name);
    const fileExtension = extname(file.name);
    const fileBaseName = basename(file.name, fileExtension);

    // Converting file data into a Node.js Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filesize = buffer.length / (1024 * 1024);

    // directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Ensure the folder exists
    await mkdir(uploadDir, { recursive: true });

    // final file path
    const filePath = join(uploadDir, uniqueName);

    // writing file to disk
    await writeFile(filePath, buffer);

    // Calculate file hash for deduplication
    const contentHash = await calculateFileHash(buffer);

    // extracting data from file
    const extractedData = await extractText(uniqueName);
    const extractedText = extractedData.text;
    const pageCount = extractedData.pageCount;

    console.log('text extracted successfully');

    try {
      const chatId = clientUrlPath.split('/').at(-1);

      if (!chatId || chatId === 'chat') {
        // this is a new chat and we need to redirect
        const cid: string = createId(); // Use CUID to match schema
        // create a new chat in db and then upload doc with the chat id
        await createNewChat(cid, userInfo.id);
        await insertDocInDatabase({
          text: extractedText,
          filename: fileBaseName,
          filetype: fileExtension,
          filesize,
          chatId: cid,
          buffer,
          pageCount,
          tenantId: userInfo.tenantId,
          aclGroups: userInfo.roles,
        });

        // Delete file after successful DB insert
        await unlink(filePath);

        // if the user also has a message with the upload then add it to db
        if (formData.get('message')) {
          const messageContent = formData.get('message');
          console.log('This is the message content: ', messageContent);
          const message: Message = {
            id: createId(),
            content: messageContent?.toString() || '',
            index: 1,
            chatId: cid,
            isHuman: true,
          };
          await createNewMessage(message);
        }

        return NextResponse.redirect(new URL(`/chat/${cid}`, new URL(req.url)), 303);
      } else {
        // Verify user owns this chat using updated fetchChatMessages
        try {
          await fetchChatMessages(chatId, userInfo.id);
        } catch {
          throw new Error('Chat not found or access denied');
        }

        await insertDocInDatabase({
          text: extractedText,
          filename: fileBaseName,
          filetype: fileExtension,
          filesize,
          chatId,
          buffer,
          pageCount,
          tenantId: userInfo.tenantId,
          aclGroups: userInfo.roles,
        });
        console.log(chatId);

        // Delete file after successful DB insert
        await unlink(filePath);
      }
    } catch (error) {
      // Clean up file on error
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error('Failed to cleanup file on error:', unlinkError);
      }
      throw error;
    }
  } catch (error) {
    console.log(`file saving failed: `, error);
    return NextResponse.json(
      { success: false, error: 'Server error saving file' },
      { status: 500 }
    );
  }
}
