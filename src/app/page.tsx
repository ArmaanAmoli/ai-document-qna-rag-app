import { Message } from "@/components/messageBox";
import Image from "next/image";
export default function Chat() {
  return (
    <div className="flex flex-row h-screen gap-3 items-center justify-center bg-zinc-50 font-sans justify-start dark:bg-black p-4">
      <div className="flex flex-col flex-1 max-w-xs border border-white/15 h-full py-8 px-8 rounded-3xl">Chat History</div>
      <main className="flex flex-1 w-full h-full flex-col items-center justify-between py-8 px-8 bg-white dark:bg-black sm:items-start border rounded-3xl border-white/15 ">
        <Message/>
      </main>
    </div>
  );
}
