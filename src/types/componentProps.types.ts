"use client";

import { useState, Dispatch , SetStateAction } from "react";

export interface MessagePropInterface{
    prompt:string;
    setPrompt: Dispatch<SetStateAction<string>>;
    file:File|null;
    setFile: Dispatch<SetStateAction<File|null>>;
    messagesArray:Message[],
    setMessagesArray:Dispatch<SetStateAction<Message[]>>;
}

export interface UploadedFile{
    file:File;
    name:string;
    size:number;
    type:string;
}

interface AgentMessage{
    content:string;
    id:number; // only important for agent
    role:'agent';
}

interface UserMessage{
    content:string;
    id?:never;
    role:'user';
}

export type Message = AgentMessage | UserMessage; // Discriminated Union
