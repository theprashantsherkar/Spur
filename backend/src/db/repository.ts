import { eq, asc } from 'drizzle-orm';
import { getDb } from './client.js';
import { conversations, messages } from './schema.js';
import type { Sender } from '../types.js';

export async function createConversation(): Promise<string> {
  const [conv] = await getDb()
    .insert(conversations)
    .values({})
    .returning({ id: conversations.id });
  return conv!.id;
}

export async function getConversation(id: string) {
  const [conv] = await getDb()
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));
  return conv ?? null;
}

export async function addMessage(conversationId: string, sender: Sender, text: string) {
  const [msg] = await getDb()
    .insert(messages)
    .values({ conversationId, sender, text })
    .returning();
  return msg!;
}

export async function getMessages(conversationId: string) {
  return getDb()
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}
