"use client";
import { MessageBox, MessageBoxBot } from "@/components/ChatMessageBox";
import { Message } from "../../../types/chat.types";
import { useState, useRef, use, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import { fetchChatHistory } from "@/app/services/chat-api-call";
import { sendPrompt } from "@/app/services/sendPrompt";
export default function Chat({ params, }: { params: Promise<{ id: string }> }) {
  const chatId = use(params).id;
  const isStreaming = useRef<boolean>(false); // if true it means agent is currently sending a Response stream.

  console.log(chatId);
  const [messagesArray, setMessagesArray] = useState<Message[]>([]);

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const props = { prompt, setPrompt, file, setFile, messagesArray, setMessagesArray, chatId, isStreaming }

  console.log("Message Array", messagesArray)

  /**
     USE EFFECT TO FETCH CHAT MESSAGES FROM DB.
     */
  useEffect(() => {
    // const fetchChatFromDb()
    console.log("USE EFFECT AT THE CHAT PAGE")
    async function send() {
      await sendPrompt(props, true);
    }
    const getChatHistory = async (chatId: string) => {
      const chatHistory = (await fetchChatHistory(chatId)).messages!;
      setMessagesArray(chatHistory);
      console.log(chatHistory , "FRONTEND");
      const lastMessage = chatHistory.at(-1)
      if (!props.isStreaming.current && lastMessage && lastMessage.isHuman) {
        // resend the messag to llm with duplicate tag.
        send()
      }
    }
    getChatHistory(chatId);
    console.log("USE EFFECT AT THE CHAT PAGE END" , messagesArray)

  }, [])



  return (
    <ChatWindow prompt={prompt} setPrompt={setPrompt} file={file} setFile={setFile} messagesArray={messagesArray} setMessagesArray={setMessagesArray} chatId={chatId} isStreaming={isStreaming}>
      <div className="w-full flex flex-col gap-4">
        {messagesArray &&
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
