import { searchContent } from '@/lib/db/queries/searchContent';
import { generateEmbedding } from '@/lib/text_utils/embedding';
import { GoogleGenAI } from '@google/genai';
import { createId } from '@paralleldrive/cuid2';
import { createNewMessage } from '@/lib/db/queries/message_queries/create_message';
import { Message } from '@/types/chat.types';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { prisma } from '@/lib/db/prisma';
import { NextRequest } from 'next/server';

interface ChatRequestBody {
  question: string;
  chatId: string;
  idx: number;
  isDuplicate: boolean;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Input validation
  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ error: 'Request body must be an object' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { question, chatId, idx, isDuplicate } = body as ChatRequestBody;

  if (typeof question !== 'string' || question.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Question is required and must be a non-empty string' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (question.length > 10000) {
    return new Response(
      JSON.stringify({ error: 'Question exceeds maximum length of 10000 characters' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (typeof chatId !== 'string' || chatId.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'chatId is required and must be a non-empty string' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (typeof idx !== 'number' || idx < 0 || !Number.isInteger(idx)) {
    return new Response(JSON.stringify({ error: 'idx must be a non-negative integer' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (typeof isDuplicate !== 'boolean') {
    return new Response(JSON.stringify({ error: 'isDuplicate must be a boolean' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log({ question, chatId, idx, isDuplicate });

  // Verify user owns this chat
  const user = getUserInfoFromCookies(request);
  const chat = await prisma.$queryRaw<{ userId: string }[]>`
        SELECT "userId" FROM "Chat" WHERE "id" = ${chatId}
    `;

  if (chat.length === 0 || chat[0].userId !== user.id) {
    return new Response(JSON.stringify({ error: 'Chat not found or access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const messageId: string = createId();

  // storing the message to db
  const message: Message = {
    id: messageId,
    content: question,
    chatId: chatId,
    index: idx,
    isHuman: true,
  };

  const messageAgent: Message = {
    id: createId(),
    content: '',
    chatId: chatId,
    index: idx + 1,
    isHuman: false,
  };

  if (!isDuplicate) {
    await createNewMessage(message);
  }

  // start with embedding the question
  const questionArr: string[] = [question];
  const embeddedQuestion = await generateEmbedding(questionArr);

  // Do a vector search over the vector db
  const embeddedQuestionE = embeddedQuestion[0];
  const contextString: string = await searchContent(embeddedQuestionE);

  // creating LLM prompt
  const prompt: string = `
    <Context>
        ${contextString}
    </Context>

    <UserQuestion>
        ${question}    
    </UserQuestion>
    `;

  console.log('LLM PROMPT: ', prompt);

  const instruction: string = `You are a precise document analysis assistant. Your job is to carefully read and analyze the provided context, then answer the user's question based solely on that context.

You will be given:
- A <Context> section containing the document or relevant excerpts to analyze
- A <UserQuestion> section containing the question to answer

Instructions:
1. Read the <Context> thoroughly before formulating your answer
2. Answer ONLY based on information present in the <Context> — do not use outside knowledge or make assumptions beyond what is stated
3. If the answer cannot be determined from the <Context>, explicitly state: "The provided context does not contain enough information to answer this question"
4. Be concise, accurate, and direct in your response
5. Always wrap your final answer inside <Answer> tags like this:

<Answer>
Your answer here
</Answer>

Do not include any text after the closing </Answer> tag.`;

  const ai = new GoogleGenAI({});
  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: instruction,
    },
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let answerBuffer: string = '';
      let foundAnswerTag = false;
      let answerComplete = false;

      try {
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (!text) continue;

          answerBuffer += text;

          if (!foundAnswerTag) {
            const openingIdx = answerBuffer.indexOf('<Answer>');
            if (openingIdx !== -1) {
              foundAnswerTag = true;
              // Remove everything up to and including <Answer>
              answerBuffer = answerBuffer.substring(openingIdx + '<Answer>'.length);
              // Check if closing tag is also in this chunk
              const closeIdx = answerBuffer.indexOf('</Answer>');
              if (closeIdx !== -1) {
                // Answer is complete in this chunk
                answerComplete = true;
                const answerContent = answerBuffer.substring(0, closeIdx);
                messageAgent.content = answerContent;
                console.log('create new message ran for llm', messageAgent);
                await createNewMessage(messageAgent);
                controller.enqueue(encoder.encode(answerContent));
                answerBuffer = answerBuffer.substring(closeIdx + '</Answer>'.length);
              } else {
                // Stream the content after <Answer>
                controller.enqueue(encoder.encode(answerBuffer));
                answerBuffer = '';
              }
            }
            // If no <Answer> tag yet, continue buffering
            continue;
          }

          if (foundAnswerTag && !answerComplete) {
            const closeIdx = answerBuffer.indexOf('</Answer>');
            if (closeIdx !== -1) {
              answerComplete = true;
              const answerContent = answerBuffer.substring(0, closeIdx);
              messageAgent.content = answerContent;
              console.log('create new message ran for llm', messageAgent);
              await createNewMessage(messageAgent);
              controller.enqueue(encoder.encode(answerContent));
              answerBuffer = answerBuffer.substring(closeIdx + '</Answer>'.length);
            } else {
              // Stream the chunk
              controller.enqueue(encoder.encode(text));
            }
          }
        }

        // If stream ended but we never found closing tag, save what we have
        if (foundAnswerTag && !answerComplete && answerBuffer.length > 0) {
          messageAgent.content = answerBuffer;
          console.log('create new message ran for llm (stream ended)', messageAgent);
          await createNewMessage(messageAgent);
        }
      } catch (error) {
        console.error('Gemini processing stream error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-message-object': JSON.stringify(message),
      'X-agent-message-object': JSON.stringify(messageAgent),
    },
  });
}
