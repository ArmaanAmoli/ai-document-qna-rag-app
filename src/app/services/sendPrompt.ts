import { Message } from "@/types/chat.types";
import { MessagePropInterface } from "@/types/componentProps.types";
import { sendChatMessage } from "./chat-api-call";
import { displayStreamingReply } from "./displayStreamingReply";

export async function sendPrompt (props:MessagePropInterface , isDuplicate:boolean):Promise<void>{
        console.log("send prompt was called" , props , isDuplicate)
        //adding user prompt to the message array
        // setMessagesArray(prev => [...prev , {role:'user' , content:props.prompt}])

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
                    const reply = await sendChatMessage(question , props.chatId , props.messagesArray.length+1 ,isDuplicate );
                    await displayStreamingReply(reply , props , isDuplicate);
                }
            }
        }

        else {
            const question = props.prompt;
            const reply = await sendChatMessage(question , props.chatId , props.messagesArray.length+1 ,isDuplicate );
            await displayStreamingReply(reply , props , isDuplicate);
        }
    }