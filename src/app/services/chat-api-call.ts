export async function sendChatMessage(documentId: string, question: string) {
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