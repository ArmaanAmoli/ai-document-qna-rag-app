"use client";
import { MessagePropInterface } from "@/types/componentProps.types";
import { useState , useRef} from "react"
export function Message(props: MessagePropInterface) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const [prompt, setPrompt] = useState("");
    return (
        <div className="absolute bottom-4 -translate-x-1/2 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.1)]
        left-1/2 w-[600px] h-[54px] border border-white/20 rounded-3xl px-4 py-4 flex items-center gap-1.5">
            <div className="flex flex-1 flex-col">
                <input
                    className="hidden"
                    type="file"
                    onChange={(event) => { props.setFile(event.target.files != null ? event.target.files[0] : null) }}
                    accept=".pdf,.txt" 
                    ref={fileInputRef} >
                </input>

                <input className="flex flex-1 focus:outline-none"
                    type="text" value={props.prompt}
                    onChange={(event) => { props.setPrompt(event.target.value) }}
                    placeholder="How can I help you today?">
                </input>

                
            </div>


            <button type="button"
                className="h-10 w-10 border border-white/20 rounded-full flex justify-center items-center overflow-hidden"
                onClick={()=>fileInputRef.current != null ? fileInputRef.current.click():null}
                >
                <img
                    src="./icons/upload.svg"
                    className="w-6/12 h-6/12 object-contain -translate-x-[0.4px] -translate-y-[.5px]"
                    alt="Send"
                />
            </button>

            <button type="button"
                className="h-10 w-10 border border-white/20 rounded-full flex justify-center items-center overflow-hidden">
                <img
                    src="./icons/send.svg"
                    className="w-6/12 h-6/12 object-contain -translate-x-[1px] translate-y-[1px]"
                    alt="Send"
                />
            </button>



        </div>
    )
}