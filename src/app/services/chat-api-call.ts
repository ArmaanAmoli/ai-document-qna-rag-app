
export async function sendChatMessage(documentId: string, question: string , chatId: string , idx:number) {
    const body = {
        documentId: documentId,
        question: question
    }
    const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    // const chatRes = await chatResponse.json();

    return chatResponse;
}

export async function fetchChatHistory(chatId:string){
    const body = {
        chatId: chatId
    };

    const res = await fetch('/api/chat/history' , {
        method: 'GET',
        body: JSON.stringify(body),
    });
    return res.json();
}