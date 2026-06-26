"use client";
import ChatWindow from "@/components/ChatWindow";
import { Message } from "@/types/componentProps.types";
import { useState } from "react";

export default function ChatDefaut() {
    const [messagesArray, setMessagesArray] = useState<Message[]>([])

    const [prompt, setPrompt] = useState("");
    const [file, setFile] = useState<File | null>(null);

    return (
        <ChatWindow prompt={prompt} setPrompt={setPrompt} file={file} setFile={setFile} messagesArray={messagesArray} setMessagesArray={setMessagesArray}>
            <></>
        </ChatWindow>
    );
}