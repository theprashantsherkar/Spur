import { config } from '../config.js';
import { createProvider } from '../llm/index.js';
import { trimHistory } from './prompt.js';
import {
  createConversation,
  getConversation,
  addMessage,
  getMessages,
} from '../db/repository.js';
import { FRIENDLY_LLM_ERROR } from '../lib/errors.js';
import type { ChatMessage } from '../types.js';

const llm = createProvider();

function toDto(m: { sender: string; text: string; createdAt: Date }): ChatMessage {
  return {
    sender: m.sender as 'user' | 'ai',
    text: m.text,
    createdAt: m.createdAt.toISOString(),
  };
}

export async function sendMessage(
  rawMessage: string,
  sessionId?: string,
): Promise<{ reply: string; sessionId: string }> {
  const message = rawMessage.trim().slice(0, config.maxMessageChars);

  // Resolve or create conversation
  let convId: string;
  if (sessionId) {
    const conv = await getConversation(sessionId);
    convId = conv ? conv.id : await createConversation();
  } else {
    convId = await createConversation();
  }

  // Persist the user message
  await addMessage(convId, 'user', message);

  // Load full history, then split off the message we just added
  const rows = await getMessages(convId);
  const allMessages = rows.map(toDto);
  const previousMessages = allMessages.slice(0, -1);
  const trimmed = trimHistory(previousMessages, config.historyMessageCap);

  // Call LLM, fall back to friendly error on any failure
  let reply: string;
  try {
    const raw = await llm.generateReply(trimmed, message);
    if (!raw.trim()) throw new Error('Empty reply from LLM');
    reply = raw;
  } catch (err) {
    const errType = err instanceof Error ? err.constructor.name : 'UnknownError';
    console.error(`[LLM Error] type=${errType} sessionId=${convId}`, err);
    reply = FRIENDLY_LLM_ERROR;
  }

  // Persist AI reply
  await addMessage(convId, 'ai', reply);

  return { reply, sessionId: convId };
}

export async function getHistory(sessionId: string): Promise<ChatMessage[]> {
  const conv = await getConversation(sessionId);
  if (!conv) return [];
  const rows = await getMessages(sessionId);
  return rows.map(toDto);
}
