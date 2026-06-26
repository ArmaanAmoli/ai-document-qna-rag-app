"use client";
import { MessageBox, MessageBoxBot } from "@/components/ChatMessageBox";
import { Message } from "@/types/componentProps.types";
import { Prompt } from "@/components/promptBox";
import { JSX, useState, use } from "react";
import ChatWindow from "@/components/ChatWindow";

export default function Chat({ params, }: { params: Promise<{ id: string }> }) {
  const chatId = use(params).id;

  /**
   USE EFFECT TO FETCH CHAT MESSAGES FROM DB.
   */

  console.log(chatId);
  const [messagesArray, setMessagesArray] = useState<Message[]>([])

  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <ChatWindow prompt={prompt} setPrompt={setPrompt} file={file} setFile={setFile} messagesArray={messagesArray} setMessagesArray={setMessagesArray}>
      <div className="w-full flex flex-col gap-4">
        {/* {<MessageBox message={"hi their"} />
          <MessageBoxBot message={"This **will** be parsed as Markdown."} />} */
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
