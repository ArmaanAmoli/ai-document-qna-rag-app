import { MessagePropInterface } from '@/types/componentProps.types';
import { sendChatMessage, apiFetch } from './chat-api-call';
import { displayStreamingReply } from './displayStreamingReply';
import { logger } from '@/lib/logger';

export async function sendPrompt(props: MessagePropInterface, isDuplicate: boolean): Promise<void> {
  const correlationId = (window as any).__RECALL_CORRELATION_ID__;
  
  logger.debug('sendPrompt called', { isDuplicate, chatId: props.chatId, correlationId });

  if (props.file != null) {
    const data = new FormData();
    data.append('file', props.file);
    if (props.messagesArray.length === 0) {
      data.append('message', props.prompt);
    }
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Upload failed' } }));
        throw new Error(error.error?.message || 'Upload failed');
      }

      const res = await response.json();
      if (res.success && res.documentId) {
        const question = props.prompt;
        const reply = await sendChatMessage(
          question,
          props.chatId,
          props.messagesArray.length + 1,
          isDuplicate
        );
        await displayStreamingReply(reply, props, isDuplicate);
      }
    } catch (error) {
      logger.error('Upload failed', error as Error, { correlationId });
      throw error;
    }
  } else {
    const question = props.prompt;
    const reply = await sendChatMessage(
      question,
      props.chatId,
      props.messagesArray.length + 1,
      isDuplicate
    );
    await displayStreamingReply(reply, props, isDuplicate);
  }
}
