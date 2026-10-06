'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface CitationProps {
  sourceChunkIds: string[];
  retrievalScores?: number[];
  chatId: string;
}

export function Citations({ sourceChunkIds, retrievalScores = [], chatId }: CitationProps) {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const [chunks, setChunks] = useState<Record<string, { content: string; documentName?: string }>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchAllChunks = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    try {
      const response = await fetch(`/api/chunks?ids=${sourceChunkIds.join(',')}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.chunks) {
          const chunksMap: Record<string, { content: string; documentName?: string }> = {};
          data.chunks.forEach((chunk: { id: string; content: string; documentName?: string }) => {
            chunksMap[chunk.id] = { content: chunk.content, documentName: chunk.documentName };
          });
          setChunks(chunksMap);
        }
      }
    } catch (error) {
      console.error('Failed to fetch chunks:', error);
    } finally {
      setLoading(false);
    }
  }, [sourceChunkIds]);

  // Fetch all chunks at once when citations are available
  useEffect(() => {
    if (sourceChunkIds.length > 0 && !fetchedRef.current && Object.keys(chunks).length === 0) {
      fetchAllChunks();
    }
  }, [sourceChunkIds, chatId, fetchAllChunks, chunks]);

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedIndices);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIndices(newExpanded);
  };

  if (sourceChunkIds.length === 0) return null;

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="font-medium">Sources ({sourceChunkIds.length})</span>
      </div>
      <div className="space-y-2">
        {sourceChunkIds.map((chunkId, index) => {
          const score = retrievalScores[index];
          const isExpanded = expandedIndices.has(index);
          const chunk = chunks[chunkId];
          const isLoading = loading && !chunk;

          return (
            <div key={chunkId} className="rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/50">
              <button
                onClick={() => toggleExpand(index)}
                className="flex w-full items-center justify-between text-left"
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    #{index + 1}
                  </span>
                  <span className="max-w-[200px] truncate text-xs font-medium text-zinc-900 dark:text-white">
                    {chunk?.documentName || `Chunk ${chunkId.substring(0, 8)}...`}
                  </span>
                  {score !== undefined && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {score.toFixed(3)}
                    </span>
                  )}
                </div>
                <svg
                  className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isExpanded && (
                <div className="mt-2 ml-6 border-l-2 border-white/10 pl-3">
                  {isLoading ? (
                    <div className="animate-pulse text-xs text-zinc-500 dark:text-zinc-400">
                      Loading source...
                    </div>
                  ) : chunk ? (
                    <div className="max-h-40 overflow-y-auto rounded bg-zinc-100/30 p-2 font-mono text-xs text-[11px] whitespace-pre-wrap text-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300">
                      {chunk.content}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Content not available
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
