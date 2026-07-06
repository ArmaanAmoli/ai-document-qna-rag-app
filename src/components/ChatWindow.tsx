import { Prompt } from "./promptBox"
import React, {useState } from "react";
import { ChatWindowComponentInterface } from "@/types/componentProps.types";


export default function ChatWindow(chats:ChatWindowComponentInterface) {
    return (
        <>
            <div className="flex h-screen gap-3 items-center justify-center bg-zinc-50 font-sans justify-start dark:bg-black p-4  min-h-[600px]">

                <div className="flex flex-col max-w-xs border border-white/15 h-full py-8 px-8 rounded-3xl min-w-[300px]">Chat History</div>

                <main className="[anchor-name:--my-box] flex flex-1 h-full flex-col items-center 
                    py-4 px-24 bg-white dark:bg-black sm:items-start border 
                    rounded-3xl border-white/15 min-w-[800px] overflow-y-scroll [&::-webkit-scrollbar]:hidden ">

                    {chats.children}
                    <div className="fixed [position-anchor:--my-box] left-[anchor(--my-box_50%)] -translate-x-1/2 bottom-4  mx-auto flex justify-center items-center w-full max-w-2xl px-4">
                        <Prompt prompt={chats.prompt} 
                        setPrompt={chats.setPrompt} 
                        file={chats.file} 
                        setFile={chats.setFile} 
                        messagesArray={chats.messagesArray} 
                        setMessagesArray={chats.setMessagesArray}
                        chatId={chats.chatId}
                        isStreaming = {chats.isStreaming}/>
                    </div>

                </main>
            </div>
        </>
    )
}