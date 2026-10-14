'use client';
import React from 'react';
import { Message } from '@/types/chat.types';
import { format } from 'date-fns';

interface MessageHistoryTabProps {
  messages: Message[];
}

export function MessageHistoryTab({ messages }: MessageHistoryTabProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500 dark:text-zinc-400">
        <div className="text-center">
          <svg
            className="mx-auto mb-3 h-12 w-12 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-sm">No messages in this conversation yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message, index) => (
        <div
          key={`${message.id}-${index}`}
          className={`flex gap-3 ${message.isHuman ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <div
            className={`flex max-w-[85%] flex-col ${message.isHuman ? 'items-end' : 'items-start'}`}
          >
            <div
              className={
                `rounded-2xl px-4 py-2.5 text-sm ` +
                (message.isHuman
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-sm')
              }
            >
              {message.content}
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {message.isHuman ? 'You' : 'Assistant'}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
              <time
                className="text-xs text-zinc-500 dark:text-zinc-400"
                dateTime={new Date().toISOString()}
              >
                {format(new Date(), 'HH:mm')}
              </time>
              {message.sourceDocumentIds && message.sourceDocumentIds.length > 0 && (
                <>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {message.sourceDocumentIds.length} source{message.sourceDocumentIds.length > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
