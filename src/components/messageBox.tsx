"use client";
import { useState } from "react"
export function Message() {

    const [prompt, setPrompt] = useState("");
    return (
        <div className="w-[600px] h-[48px] border border-white/20 rounded-3xl px-4 py-2 flex items-center">
            <input className="flex flex-1 focus:outline-none" type="text" value={prompt} onChange={(event) => { setPrompt(event.target.value) }} placeholder="How can I help you today?"></input>
            <button type="button" className="h-10 w-10 border border-white/20 rounded-full flex justify-center items-center overflow-hidden">
                <img
                    src="./icons/send.svg"
                    className="w-6/12 h-6/12 object-contain -translate-x-[1px] translate-y-[1px]"
                    alt="Send"
                />
            </button>
        </div>
    )
}