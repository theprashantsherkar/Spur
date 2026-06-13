export type Sender = 'user' | 'ai';

export interface ChatMessage {
  sender: Sender;
  text: string;
  createdAt: string;
}
