import { searchContent } from '@/lib/db/queries/searchContent';
import { generateEmbedding } from '@/lib/text_utils/embedding';
import { GoogleGenAI } from '@google/genai';
import { createId } from '@paralleldrive/cuid2';
import { createNewMessage } from '@/lib/db/queries/message_queries/create_message';
import { fetchChatMessages } from '@/lib/db/queries/chat_queries/fetchChatMessages';
import { Message } from '@/types/chat.types';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createRagTrace, createSpan, getLangfuse } from '@/lib/observability/langfuse';
import { asyncHandler, Errors } from '@/lib/middleware/error-handler';
import { logger } from '@/lib/logger';

interface ChatRequestBody {
  question: string;
  chatId: string;
  idx: number;
  isDuplicate: boolean;
}

export const POST = asyncHandler(async (request: NextRequest) => {
  const correlationId = request.headers.get('x-correlation-id');
  let body: unknown;
  
  try {
    body = await request.json();
  } catch {
    throw Errors.validationInvalidInput('Invalid JSON body', {}, correlationId);
  }

  // Input validation
  if (!body || typeof body !== 'object') {
    throw Errors.validationInvalidInput('Request body must be an object', {}, correlationId);
  }

  const { question, chatId, idx, isDuplicate } = body as ChatRequestBody;

  if (typeof question !== 'string' || question.trim().length === 0) {
    throw Errors.validationMissingField('question', { field: 'question' }, correlationId);
  }

  if (question.length > 10000) {
    throw Errors.validationInvalidInput('Question exceeds maximum length of 10000 characters', { length: question.length }, correlationId);
  }

  if (typeof chatId !== 'string' || chatId.trim().length === 0) {
    throw Errors.validationMissingField('chatId', { field: 'chatId' }, correlationId);
  }

  if (typeof idx !== 'number' || idx < 0 || !Number.isInteger(idx)) {
    throw Errors.validationInvalidInput('idx must be a non-negative integer', { idx }, correlationId);
  }

  if (typeof isDuplicate !== 'boolean') {
    throw Errors.validationInvalidInput('isDuplicate must be a boolean', { isDuplicate }, correlationId);
  }

  logger.info('Chat request received', { question: question.substring(0, 100), chatId, idx, isDuplicate, correlationId });

  // Verify user owns this chat
  const user = getUserInfoFromCookies(request);
  
  const chat = await prisma.$queryRaw<{ userId: string }[]>`
    SELECT \"userId\" FROM \"Chat\" WHERE \"id\" = ${chatId}
  `;

  if (chat.length === 0) {
    logger.warn('Chat not found', { chatId, userId: user.id, correlationId });
    throw Errors.chatNotFound(chatId, { userId: user.id }, correlationId);
  }

  if (chat[0].userId !== user.id) {
    logger.warn('Chat access denied', { chatId, userId: user.id, correlationId });
    throw Errors.chatAccessDenied(chatId, user.id, {}, correlationId);
  }

  const messageId: string = createId();
  const messageAgentId: string = createId();

  // storing the message to db
  const message: Message = {
    id: messageId,
    content: question,
    chatId: chatId,
    index: idx,
    isHuman: true,
  };

  const messageAgent: Message = {
    id: messageAgentId,
    content: '',
    chatId: chatId,
    index: idx + 1,
    isHuman: false,
  };

  if (!isDuplicate) {
    try {
      await createNewMessage(message);
    } catch (error) {
      logger.error('Failed to save user message', error, { chatId, messageId, correlationId });
      throw Errors.chatMessageFailed({ chatId, messageId }, error, correlationId);
    }
  }

  // Fetch conversation history for context
  const chatHistory = await fetchChatMessages(chatId, user.id);
  const recentHistory = chatHistory.slice(-10); // Last 10 messages for context

  // Create trace for observability
  const trace = createRagTrace({
    userId: user.id,
    sessionId: chatId,
    query: question,
    tenantId: user.tenantId,
  });

  // Start embedding span
  const embedSpan = createSpan(trace, { name: 'embedding', input: question });
  
  // Generate embedding
  let embeddedQuestion: number[][];
  try {
    const questionArr: string[] = [question];
    embeddedQuestion = await generateEmbedding(questionArr);
    embedSpan.end({ output: { dimensions: embeddedQuestion[0].length } });
  } catch (error) {
    embedSpan.end({ level: 'ERROR', output: { error: String(error) } });
    logger.error('Embedding generation failed', error, { question: question.substring(0, 100), correlationId });
    throw Errors.embeddingGenerationFailed({ question: question.substring(0, 100) }, error, correlationId);
  }

  // Start search span
  const searchSpan = createSpan(trace, { name: 'hybrid_search', input: { question: question.substring(0, 100) } });
  
  // Do a hybrid search (vector + BM25) over the vector db with ACL filtering
  const embeddedQuestionE = embeddedQuestion[0];
  let searchResult;
  try {
    searchResult = await searchContent({
      embedding: embeddedQuestionE,
      limit: 10,
      tenantId: user.tenantId || undefined,
      aclGroups: user.roles || [],
      query: question,
    });
    searchSpan.end({ output: { chunksFound: searchResult.chunks.length } });
  } catch (error) {
    searchSpan.end({ level: 'ERROR', output: { error: String(error) } });
    logger.error('Search failed', error, { correlationId });
    throw Errors.ragSearchFailed({ question: question.substring(0, 100) }, error, correlationId);
  }

  const contextString: string = searchResult.context;
  const retrievedChunks = searchResult.chunks;

  if (retrievedChunks.length === 0) {
    logger.info('No relevant context found', { question: question.substring(0, 100), correlationId });
    throw Errors.ragNoRelevantContext(question, { chatId }, correlationId);
  }

  // creating LLM prompt
  const prompt: string = `
    <Context>
        ${contextString}
    </Context>

    <UserQuestion>
        ${question}    
    </UserQuestion>
    `;

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

  // Start LLM span
  const llmSpan = createSpan(trace, { name: 'llm_generation', input: { promptLength: prompt.length } });

  const ai = new GoogleGenAI({});
  let responseStream;
  try {
    responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: instruction,
      },
    });
  } catch (error) {
    llmSpan.end({ level: 'ERROR', output: { error: String(error) } });
    logger.error('LLM generation failed', error, { correlationId });
    throw Errors.llmGenerationFailed({ model: 'gemini-2.5-flash' }, error, correlationId);
  }

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
              answerBuffer = answerBuffer.substring(openingIdx + '<Answer>'.length);
              const closeIdx = answerBuffer.indexOf('</Answer>');
              if (closeIdx !== -1) {
                answerComplete = true;
                const answerContent = answerBuffer.substring(0, closeIdx);
                await saveAgentMessage(messageAgent, answerContent, retrievedChunks, controller, encoder);
                controller.enqueue(encoder.encode(answerContent));
                answerBuffer = answerBuffer.substring(closeIdx + '</Answer>'.length);
              } else {
                controller.enqueue(encoder.encode(answerBuffer));
                answerBuffer = '';
              }
            }
            continue;
          }

          if (foundAnswerTag && !answerComplete) {
            const closeIdx = answerBuffer.indexOf('</Answer>');
            if (closeIdx !== -1) {
              answerComplete = true;
              const answerContent = answerBuffer.substring(0, closeIdx);
              await saveAgentMessage(messageAgent, answerContent, retrievedChunks, controller, encoder);
              controller.enqueue(encoder.encode(answerContent));
              answerBuffer = answerBuffer.substring(closeIdx + '</Answer>'.length);
            } else {
              controller.enqueue(encoder.encode(text));
            }
          }
        }

        // If stream ended but we never found closing tag, save what we have
        if (foundAnswerTag && !answerComplete && answerBuffer.length > 0) {
          await saveAgentMessage(messageAgent, answerBuffer, retrievedChunks, controller, encoder);
        } else if (!foundAnswerTag) {
          logger.warn('LLM response did not contain <Answer> tag', { correlationId });
        }
      } catch (error) {
        llmSpan.end({ level: 'ERROR', output: { error: String(error) } });
        logger.error('Gemini processing stream error', error, { correlationId });
        controller.error(error);
        throw Errors.llmStreamingFailed({ correlationId }, error, correlationId);
      } finally {
        controller.close();
        llmSpan.end({ output: { answerLength: messageAgent.content.length } });
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

  async function saveAgentMessage(
    msg: Message,
    content: string,
    chunks: typeof retrievedChunks,
    controller: ReadableStreamDefaultController,
    encoder: TextEncoder
  ) {
    msg.content = content;
    msg.sourceChunkIds = chunks.map(c => c.id);
    msg.sourceDocumentIds = chunks.map(c => c.documentId);
    msg.retrievalScores = chunks.map(c => c.score);
    msg.modelVersion = 'gemini-2.5-flash';
    msg.promptVersion = 'v1';
    
    try {
      await createNewMessage(msg);
      logger.info('Agent message saved', { messageId: msg.id, chatId, correlationId });
    } catch (error) {
      logger.error('Failed to save agent message', error, { messageId: msg.id, chatId, correlationId });
      throw Errors.chatMessageFailed({ messageId: msg.id, chatId }, error, correlationId);
    }
  }
});
