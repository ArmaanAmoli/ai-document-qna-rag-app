export async function sendChatMessage(
  question: string,
  chatId: string,
  idx: number,
  isDuplicate: boolean
) {
  const chatResponse = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ question, chatId, idx, isDuplicate }),
    credentials: 'include',
  });

  return chatResponse;
}

export async function fetchChatHistory(chatId: string) {
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
