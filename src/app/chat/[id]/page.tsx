"use client";
import { MessageBox, MessageBoxBot } from "@/components/ChatMessageBox";
import { Message } from "../../../types/chat.types";
import { useState, useRef, use, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { fetchChatHistory } from "@/app/services/chat-api-call";

export default function Chat({ params, }: { params: Promise<{ id: string }> }) {
  const chatId = use(params).id;
  const agentIsResponding = useRef<boolean>(false);

  console.log(chatId);
  const [messagesArray, setMessagesArray] = useState<Message[]>([])

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /**
     USE EFFECT TO FETCH CHAT MESSAGES FROM DB.
     */
  useEffect(() => {
    // const fetchChatFromDb()
    const getChatHistory = async(chatId:string)=>{
      const chatHistory = await fetchChatHistory(chatId);
      setMessagesArray(chatHistory);
    }
    getChatHistory(chatId);
  },[])

  return (
    <ChatWindow prompt={prompt} setPrompt={setPrompt} file={file} setFile={setFile} messagesArray={messagesArray} setMessagesArray={setMessagesArray} chatId={chatId}>
      <div className="w-full flex flex-col gap-4">
        {
          messagesArray.map((value, index) => {
            return (
              <div className="w-full flex flex-col gap-4" key={index}>
                {value.isHuman && <MessageBox message={value.content} key={index} />}
                {!value.isHuman && <MessageBoxBot message={value.content} key={index} />}
              </div>)
          })
        }
      </div>
    </ChatWindow>
  );
}
