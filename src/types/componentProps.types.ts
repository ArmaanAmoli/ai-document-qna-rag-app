"use client";

import { useState, Dispatch , SetStateAction } from "react";

export interface MessagePropInterface{
    prompt:string;
    setPrompt: Dispatch<SetStateAction<string>>;
    file:File|null;
    setFile: Dispatch<SetStateAction<File|null>>;
}

export interface UploadedFile{
    file:File;
    name:string;
    size:number;
    type:string;
}