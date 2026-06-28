"use client";
import { MessagePropInterface , MessageUI} from "@/types/componentProps.types";
import { useState, useRef } from "react"
import { sendChatMessage } from "@/app/services/chat-api-call";

export function Prompt(props: MessagePropInterface) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const setMessagesArray = props.setMessagesArray;
    const [isStreaming , setIsStreaming] = useState(false);

    const displayStreamingReply = async (reply: Response) => {
        console.log("message Streaming started");
        const reader = reply.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        const agentId:number = Date.now()
        const newMessageAgent:MessageUI = {role:'agent' , id:agentId , content:""};
        props.setMessagesArray(prev=>[...prev , newMessageAgent]);
        setIsStreaming(true);
        console.log("Reader Started")
        while(true){
            const {done , value} = await reader.read();
            if(done)break;
            accumulated += decoder.decode(value);

            //updating only the streaming message
            setMessagesArray(prev=>prev.map(msg=>
                msg.id===agentId?{...msg , content:accumulated}:msg
            ));
        }
        console.log("Reader Ended")
        setIsStreaming(false);
        console.log("message Streaming ended");
    }

    const sendPrompt = async () => {
        //adding user prompt to the message array
        setMessagesArray(prev => [...prev , {role:'user' , content:props.prompt}])

        if (props.file != null) {

            const data = new FormData();
            data.append('file', props.file);
            if (props.messagesArray.length === 0){data.append('message' , props.prompt)};
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            })
            if(response.redirected){
                window.location.href = response.url; 
                return;
            }
            const res = await response.json();
            if ("success" in res) {
                if (res.success == true && "documentId" in res) {
                    const documentId = res.documentId;
                    localStorage.setItem('documentId', documentId);
                    const question = props.prompt;
                    const reply = await sendChatMessage(documentId, question);
                    await displayStreamingReply(reply);
                }
            }
        }

        else {
            //fetching doc id from local storage
            const documentId = localStorage.getItem("documentId")
            const question = props.prompt;
            const reply = await sendChatMessage(documentId! , question);
            await displayStreamingReply(reply);
        }
    }
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
                    sendPrompt();
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