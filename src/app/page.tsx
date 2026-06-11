"use client";

import { MessageBox , MessageBoxBot} from "@/components/ChatMessageBox";

import { Prompt } from "@/components/promptBox";
import Image from "next/image";
import { useState } from "react";
export default function Chat() {

  const [prompt , setPrompt] = useState("");
  const [file , setFile] = useState<File|null>(null);

  return (
    <div className="flex flex-row h-screen gap-3 items-center justify-center bg-zinc-50 font-sans justify-start dark:bg-black p-4">
      
      <div className="flex flex-col flex-1 max-w-xs border border-white/15 h-full py-8 px-8 rounded-3xl">Chat History</div>

      <main className="relative flex flex-1 w-full h-full flex-col items-center 
      justify-between py-8 px-24 bg-white dark:bg-black sm:items-start border 
      rounded-3xl border-white/15">

        <div className="w-full flex flex-col gap-4">
        <MessageBox message={"hi their"}/>
        <MessageBoxBot message={"This **will** be parsed as Markdown."}/>
        </div>

        <Prompt prompt={prompt}  setPrompt={setPrompt} file={file}  setFile={setFile} />

      </main>
    </div>
  );
}
