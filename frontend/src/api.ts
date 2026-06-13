const BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:8080';
const FETCH_TIMEOUT_MS = 25_000;

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

export async function sendMessage(
  message: string,
  sessionId?: string,
): Promise<{ reply: string; sessionId: string }> {
  let res: Response;
  try {
    res = await fetchWithTimeout(`${BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out — please try again.');
    }
    throw new Error('Could not reach the server — check your connection.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchHistory(
  sessionId: string,
): Promise<{ sessionId: string; messages: Message[] }> {
  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${BASE_URL}/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
      {},
    );
  } catch {
    throw new Error('Could not load history.');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
