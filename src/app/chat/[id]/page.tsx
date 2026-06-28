"use client";
import { MessageBox, MessageBoxBot } from "@/components/ChatMessageBox";
import { MessageUI } from "@/types/componentProps.types";
import { Prompt } from "@/components/promptBox";
import { JSX, useState, useRef, use, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { fetchChatHistory } from "@/app/services/chat-api-call";

export default function Chat({ params, }: { params: Promise<{ id: string }> }) {
  const chatId = use(params).id;
  const agentIsResponding = useRef<boolean>(false);

  console.log(chatId);
  const [messagesArray, setMessagesArray] = useState<MessageUI[]>([])

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /**
     USE EFFECT TO FETCH CHAT MESSAGES FROM DB.
     */
  useEffect(() => {
    // const fetchChatFromDb()
    const getChatHistory = async(chatId:string)=>{
      return await fetchChatHistory(chatId);
    }
    setMessagesArray([])
    
  },[])

  return (
    <ChatWindow prompt={prompt} setPrompt={setPrompt} file={file} setFile={setFile} messagesArray={messagesArray} setMessagesArray={setMessagesArray}>
      <div className="w-full flex flex-col gap-4">
        {
          messagesArray.map((value, index) => {
            return (
              <div className="w-full flex flex-col gap-4" key={index}>
                {value.role === 'user' && <MessageBox message={value.content} key={index} />}
                {value.role === 'agent' && <MessageBoxBot message={value.content} key={index} />}
              </div>)
          })
        }
      </div>
    </ChatWindow>
  );
}
