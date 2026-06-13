const BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:8080';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export async function sendMessage(
  message: string,
  sessionId?: string,
): Promise<{ reply: string; sessionId: string }> {
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchHistory(
  sessionId: string,
): Promise<{ sessionId: string; messages: Message[] }> {
  const res = await fetch(
    `${BASE_URL}/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
