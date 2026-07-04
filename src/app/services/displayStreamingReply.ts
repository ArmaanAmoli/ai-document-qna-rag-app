import { MessagePropInterface } from "@/types/componentProps.types";
import { Message } from "../../types/chat.types"


export async function displayStreamingReply(reply: Response , props:MessagePropInterface , isDuplicate:Boolean) {
    console.log("message Streaming started");
    const reader = reply.body!.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    const newMessageAgent: Message = JSON.parse(reply.headers.get('X-agent-message-object')!);
    const newMessageUser: Message = JSON.parse(reply.headers.get('X-message-object')!);

    if(!isDuplicate) {props.setMessagesArray(prev => [...prev, newMessageUser, newMessageAgent]);}
    else{props.setMessagesArray(prev => [...prev, newMessageAgent]);}
    console.log("Reader Started")

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value);

        //updating only the streaming message
        props.setMessagesArray(prev => prev.map(msg =>
            msg.id === newMessageAgent.id ? { ...msg, content: accumulated } : msg
        ));
    }
    console.log("Reader Ended")
    console.log("message Streaming ended");
}