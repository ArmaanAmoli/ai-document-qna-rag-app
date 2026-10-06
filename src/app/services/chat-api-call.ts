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

export async function updateChatTitle(chatId: string, title: string) {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
    credentials: 'include',
  });
  return res.json();
}

export async function deleteChat(chatId: string) {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

// Document management API calls
export async function renameDocument(documentId: string, name: string) {
  const res = await fetch(`/api/documents/${documentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    credentials: 'include',
  });
  return res.json();
}

export async function retryDocument(documentId: string) {
  const res = await fetch(`/api/documents/${documentId}`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
}

export async function deleteDocument(documentId: string) {
  const res = await fetch(`/api/documents/${documentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

export async function fetchDocuments(chatId: string) {
  const res = await fetch(`/api/chats/${chatId}/documents`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}
