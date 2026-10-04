export async function sendChatMessage(
  question: string,
  chatId: string,
  idx: number,
  isDuplicate: boolean
) {
  // question chatID , idx-> length of message array , isDuplicate ,
  const body = {
    question,
    chatId,
    idx,
    isDuplicate,
  };

  const chatResponse = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    credentials: 'include',
  });
  // const chatRes = await chatResponse.json();

  return chatResponse;
}

export async function fetchChatHistory(chatId: string) {
  const body = {
    chatId: chatId,
  };

  const res = await fetch(`/api/chat/history/${chatId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function fetchUserChats() {
  const res = await fetch(`/api/chats`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}
