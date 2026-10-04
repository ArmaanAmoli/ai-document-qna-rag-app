interface Message {
  id: string;
  chatId: string;
  content: string;
  index: number;
  isHuman: boolean;
  sourceChunkIds?: string[];
  retrievalScores?: number[];
  modelVersion?: string;
  promptVersion?: string;
  latencyMs?: number;
  tokenUsage?: Record<string, unknown>;
}
export type { Message };
