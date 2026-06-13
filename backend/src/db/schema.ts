import { pgTable, uuid, text, jsonb, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  channel: text('channel').notNull().default('livechat'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata').notNull().default({}),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  sender: text('sender').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('sender_check', sql`${table.sender} IN ('user', 'ai')`),
  index('messages_conversation_id_created_at_idx').on(table.conversationId, table.createdAt),
]);
