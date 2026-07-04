"use client";
import { MessagePropInterface } from "@/types/componentProps.types";
import { useState, useRef, useEffect } from "react"
import { Message } from "@/types/chat.types";
import { sendPrompt } from "@/app/services/sendPrompt";
import { displayStreamingReply } from "@/app/services/displayStreamingReply";
import { send } from "process";


export function Prompt(props: MessagePropInterface) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageArray = props.messagesArray;
    const lastMessage: Message | undefined = messageArray.at(-1);

    useEffect(() => {
        /*
          if the last message is by human than we will resend the message to llm
        */
        async function send() {
            await sendPrompt(props, true);
        }
        if (!props.isStreaming.current && lastMessage && lastMessage.isHuman) {
            // resend the messag to llm with duplicate tag.
            send()
        }

    }, [])


    return (
        <div className="z-10 shadow-[0_4px_30px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.1)]
        left-1/2 w-[600px] min-h-[54px] max-h-[100px] border border-white/20 rounded-3xl px-4 py-4 flex items-center gap-1.5
        bg-black/40 backdrop-blur-md">

            <div className="flex flex-1 flex-col">
                {props.file && <div>
                    {`${props.file?.name}`}

                </div>}
                <input
                    className="hidden"
                    type="file"
                    onChange={(event) => { props.setFile(event.target.files != null ? event.target.files[0] : null) }}
                    accept=".pdf,.txt"
                    ref={fileInputRef} >
                </input>

                <textarea className="flex flex-1 focus:outline-none resize-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    value={props.prompt}
                    onChange={(event) => { props.setPrompt(event.target.value) }}
                    placeholder="How can I help you today?">
                </textarea>


            </div>


            <button type="button"
                className="h-10 w-10 border border-white/20 rounded-full flex justify-center items-center overflow-hidden hover:bg-white/20 transition-colors duration-300 ease-in-out"
                onClick={() => fileInputRef.current != null ? fileInputRef.current.click() : null}
            >
                <img
                    src="/icons/upload.svg"
                    className="w-6/12 h-6/12 object-contain -translate-x-[0.4px] -translate-y-[.5px]"
                    alt="Send"
                />
            </button>

            <button type="button"
                onClick={() => {
                    sendPrompt(props, false);
                }}
                className="h-10 w-10 border border-white/20 rounded-full flex justify-center items-center overflow-hidden hover:bg-white/20 hover:transition">
                <img
                    src="/icons/send.svg"
                    className="w-6/12 h-6/12 object-contain -translate-x-[1px] translate-y-[1px]"
                    alt="Send"
                />
            </button>



        </div>
    )
}