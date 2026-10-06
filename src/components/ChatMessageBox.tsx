import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Citations } from './Citations';
import { Message } from '@/types/chat.types';

interface MessageBoxProps {
  message: string;
}

interface MessageBoxBotProps {
  message: string;
  sourceChunkIds?: string[];
  retrievalScores?: number[];
  chatId?: string;
}

export function MessageBox({ message }: MessageBoxProps) {
  return (
    <div className="mb-4 ml-auto flex max-w-100 rounded-3xl border border-white/20 px-4 py-2">
      <p className="text-md">{message}</p>
    </div>
  );
}

export function MessageBoxBot({
  message,
  sourceChunkIds,
  retrievalScores,
  chatId,
}: MessageBoxBotProps) {
  return (
    <div className="mb-4 flex w-full flex-col rounded-xl border border-white/10 px-4 py-2">
      <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
      {sourceChunkIds && sourceChunkIds.length > 0 && chatId && (
        <Citations
          sourceChunkIds={sourceChunkIds}
          retrievalScores={retrievalScores}
          chatId={chatId}
        />
      )}
    </div>
  );
}
