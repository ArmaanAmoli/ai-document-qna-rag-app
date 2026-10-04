'use client';
import { MessagePropInterface } from '@/types/componentProps.types';
import { useRef, useEffect, useCallback } from 'react';
import { sendPrompt } from '@/app/services/sendPrompt';
import Image from 'next/image';

export function Prompt(props: MessagePropInterface) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResend = useCallback(async () => {
    if (!props.isStreaming.current && props.messagesArray.length > 0) {
      const lastMessage = props.messagesArray[props.messagesArray.length - 1];
      if (lastMessage && lastMessage.isHuman) {
        await sendPrompt(props, true);
      }
    }
  }, [props]);

  useEffect(() => {
    handleResend();
  }, [handleResend]);

  return (
    <div className="left-1/2 z-10 flex max-h-[100px] min-h-[54px] w-[600px] items-center gap-1.5 rounded-3xl border border-white/20 bg-black/40 px-4 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md">
      <div className="flex flex-1 flex-col">
        {props.file && <div>{`${props.file?.name}`}</div>}
        <input
          className="hidden"
          type="file"
          onChange={event => {
            props.setFile(event.target.files != null ? event.target.files[0] : null);
          }}
          accept=".pdf,.txt"
          ref={fileInputRef}
        />

        <textarea
          className="flex flex-1 resize-none [scrollbar-width:none] [-ms-overflow-style:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
          value={props.prompt}
          onChange={event => {
            props.setPrompt(event.target.value);
          }}
          placeholder="How can I help you today?"
        ></textarea>
      </div>

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 transition-colors duration-300 ease-in-out hover:bg-white/20"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src="/icons/upload.svg"
          alt="Upload"
          width={12}
          height={12}
          className="-translate-x-[0.4px] -translate-y-[.5px] object-contain"
        />
      </button>

      <button
        type="button"
        onClick={() => {
          sendPrompt(props, false);
        }}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 hover:bg-white/20 hover:transition"
      >
        <Image
          src="/icons/send.svg"
          alt="Send"
          width={12}
          height={12}
          className="-translate-x-[1px] translate-y-[1px] object-contain"
        />
      </button>
    </div>
  );
}
