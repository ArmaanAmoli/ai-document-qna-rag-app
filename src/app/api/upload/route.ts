import { writeFile, mkdir, unlink } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join, extname, basename } from 'path';
import { extractText } from '@/lib/text_utils/extract-text';
import { PDFData } from '@/types';
import { createId } from '@paralleldrive/cuid2';
import { insertDocInDatabase } from '@/lib/text_utils/insert-doc-in-database';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { createNewChat } from '@/lib/db/queries/chat_queries/createChat';
import { createNewMessage } from '@/lib/db/queries/message_queries/create_message';
import { Message } from '@/types/chat.types';
import { fetchChatMessages } from '@/lib/db/queries/chat_queries/fetchChatMessages';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
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

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` },
        { status: 400 }
      );
    }

    // renaming file to a unique name
    const fileExtension: string = extname(file.name);
    const fileBaseName: string = basename(file.name, fileExtension);
    const uniqueName: string = `${fileBaseName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${fileExtension}`;

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

    // extracting data from file
    const extractedData: string | PDFData = await extractText(uniqueName);
    const extractedText = extractedData;

    console.log('text extracted successfully');

    try {
      const chatId = clientUrlPath.split('/').at(-1);

      if (!chatId || chatId === 'chat') {
        // this is a new chat and we need to redirect
        const cid: string = createId(); // Use CUID to match schema
        // create a new chat in db and then upload doc with the chat id
        await createNewChat(cid, userInfo.id);
        await insertDocInDatabase(extractedText, fileBaseName, fileExtension, filesize, cid);

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

        await insertDocInDatabase(extractedText, fileBaseName, fileExtension, filesize, chatId);
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
