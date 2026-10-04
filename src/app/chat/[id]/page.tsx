'use client';
import { MessageBox, MessageBoxBot } from '@/components/ChatMessageBox';
import { Message } from '../../../types/chat.types';
import { useState, useRef, use, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { fetchChatHistory } from '@/app/services/chat-api-call';
import { sendPrompt } from '@/app/services/sendPrompt';

export default function Chat({ params }: { params: Promise<{ id: string }> }) {
  const chatId = use(params).id;
  const isStreaming = useRef<boolean>(false);

  console.log(chatId);
  const [messagesArray, setMessagesArray] = useState<Message[]>([]);

  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    console.log('USE EFFECT AT THE CHAT PAGE');
    const getChatHistory = async (chatId: string) => {
      const chatHistory = (await fetchChatHistory(chatId)).messages!;
      setMessagesArray(chatHistory);
      console.log(chatHistory, 'FRONTEND');
      const lastMessage = chatHistory.at(-1);
      if (!isStreaming.current && lastMessage && lastMessage.isHuman) {
        setPrompt(lastMessage.content);
        await sendPrompt(
          {
            prompt,
            setPrompt,
            file,
            setFile,
            messagesArray,
            setMessagesArray,
            chatId,
            isStreaming,
          },
          true
        );
      }
    };
    getChatHistory(chatId);
    console.log('USE EFFECT AT THE CHAT PAGE END', messagesArray);
  }, [chatId]);

  return (
    <ChatWindow
      prompt={prompt}
      setPrompt={setPrompt}
      file={file}
      setFile={setFile}
      messagesArray={messagesArray}
      setMessagesArray={setMessagesArray}
      chatId={chatId}
      isStreaming={isStreaming}
    >
      <div className="flex w-full flex-col gap-4">
        {messagesArray &&
          messagesArray.map((value, index) => (
            <div className="flex w-full flex-col gap-4" key={index}>
              {value.isHuman && <MessageBox message={value.content} key={index} />}
              {!value.isHuman && <MessageBoxBot message={value.content} key={index} />}
            </div>
          ))}
      </div>
    </ChatWindow>
  );
}
