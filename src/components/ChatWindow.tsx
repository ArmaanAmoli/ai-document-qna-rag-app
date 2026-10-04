import { Prompt } from './promptBox';
import React from 'react';
import { ChatWindowComponentInterface } from '@/types/componentProps.types';
import { ChatHistorySidebar } from './ChatHistorySidebar';

export default function ChatWindow(chats: ChatWindowComponentInterface) {
  return (
    <>
      <div className="flex h-screen min-h-[600px] gap-3 bg-zinc-50 p-4 font-sans dark:bg-black">
        <ChatHistorySidebar />

        <main className="flex h-full min-w-[800px] flex-1 flex-col items-center overflow-y-scroll rounded-3xl border border-white/15 bg-white px-24 py-4 [anchor-name:--my-box] sm:items-start dark:bg-black [&::-webkit-scrollbar]:hidden">
          {chats.children}
          <div className="fixed bottom-4 left-[anchor(--my-box_50%)] mx-auto flex w-full max-w-2xl -translate-x-1/2 items-center justify-center px-4 [position-anchor:--my-box]">
            <Prompt
              prompt={chats.prompt}
              setPrompt={chats.setPrompt}
              file={chats.file}
              setFile={chats.setFile}
              messagesArray={chats.messagesArray}
              setMessagesArray={chats.setMessagesArray}
              chatId={chats.chatId}
              isStreaming={chats.isStreaming}
            />
          </div>
        </main>
      </div>
    </>
  );
}
