'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { fetchUserChats, updateChatTitle, deleteChat } from '@/app/services/chat-api-call';
import { ChatWithLatestMessage } from '@/lib/db/queries/chat_queries/fetchUserChats';

export function ChatHistorySidebar() {
  const [chats, setChats] = useState<ChatWithLatestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadChats() {
      try {
        const data = await fetchUserChats();
        if (data.chats) {
          setChats(data.chats);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadChats();
  }, []);

  const handleNewChat = () => {
    router.push('/chat');
    router.refresh();
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const currentChatId = pathname.split('/chat/')[1];

  const handleRenameStart = (chat: ChatWithLatestMessage) => {
    setRenamingChatId(chat.id);
    setRenameTitle(chat.title || chat.latestMessage?.content?.substring(0, 50) || 'New Chat');
  };

  const handleRenameConfirm = async (chatId: string) => {
    try {
      await updateChatTitle(chatId, renameTitle.trim());
      setChats(prev =>
        prev.map(chat => (chat.id === chatId ? { ...chat, title: renameTitle.trim() } : chat))
      );
      setRenamingChatId(null);
      setRenameTitle('');
    } catch (error) {
      console.error('Failed to rename chat:', error);
      alert('Failed to rename chat');
    }
  };

  const handleDeleteConfirm = async (chatId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this conversation? This action cannot be undone.'
      )
    ) {
      return;
    }
    try {
      await deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        router.push('/chat');
        router.refresh();
      }
      setDeletingChatId(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col border-r border-white/15 bg-zinc-50 p-4 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">History</h2>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full max-w-[320px] min-w-[280px] flex-col border-r border-white/15 bg-zinc-50 p-4 dark:bg-black">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">History</h2>
        <button
          onClick={handleNewChat}
          className="rounded-lg p-2 transition-colors hover:bg-white/20 dark:hover:bg-zinc-800"
          aria-label="New chat"
        >
          <svg
            className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
          <svg
            className="mb-3 h-12 w-12 opacity-50"
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
          <p className="text-sm">No conversations yet</p>
          <p className="mt-1 text-xs">Start a new chat to see history here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {chats.map(chat => {
              const isRenaming = renamingChatId === chat.id;
              const displayTitle =
                chat.title ||
                (chat.latestMessage
                  ? truncateText(chat.latestMessage.content)
                  : 'Empty conversation');

              if (isRenaming) {
                return (
                  <li key={chat.id}>
                    <div className="flex items-center gap-2 rounded-xl p-2">
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={e => setRenameTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRenameConfirm(chat.id)}
                        onBlur={() => handleRenameConfirm(chat.id)}
                        className="flex-1 rounded-md border border-white/20 bg-white/50 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameConfirm(chat.id)}
                        className="rounded-lg p-1.5 text-zinc-600 hover:bg-white/20 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        aria-label="Save"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={chat.id}>
                  <div className="relative">
                    <Link
                      href={'/chat/' + chat.id}
                      className={
                        'flex items-start gap-3 rounded-xl p-3 transition-all duration-200 ' +
                        (chat.id === currentChatId
                          ? 'bg-white/50 dark:bg-zinc-800/50'
                          : 'hover:bg-white/30 dark:hover:bg-zinc-800')
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                          {displayTitle}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDate(chat.updatedAt)}
                        </p>
                      </div>
                      {chat.id === currentChatId && (
                        <svg
                          className="h-4 w-4 flex-shrink-0 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </Link>
                    <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleRenameStart(chat)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/20 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        aria-label="Rename"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingChatId(chat.id)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/20 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        aria-label="Delete"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {deletingChatId === chat.id && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                      onClick={() => setDeletingChatId(null)}
                    >
                      <div
                        className="mx-4 w-[300px] rounded-xl bg-white p-6 dark:bg-zinc-900"
                        onClick={e => e.stopPropagation()}
                      >
                        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                          Delete conversation?
                        </h3>
                        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                          This action cannot be undone. All messages and associated documents will
                          be permanently deleted.
                        </p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setDeletingChatId(null)}
                            className="rounded-lg border border-white/20 px-4 py-2 text-zinc-700 hover:bg-white/20 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(chat.id)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
