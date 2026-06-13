import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  MAX_OUTPUT_TOKENS: z.coerce.number().default(1024),
  MAX_MESSAGE_CHARS: z.coerce.number().default(4000),
  HISTORY_MESSAGE_CAP: z.coerce.number().default(20),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Missing or invalid environment variables:');
  for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(`  ${key}: ${msgs?.join(', ')}`);
  }
  process.exit(1);
}

const env = parsed.data;

export const config = {
  databaseUrl: env.DATABASE_URL,
  port: env.PORT,
  corsOrigin: env.CORS_ORIGIN,
  geminiApiKey: env.GEMINI_API_KEY,
  geminiModel: env.GEMINI_MODEL,
  maxOutputTokens: env.MAX_OUTPUT_TOKENS,
  maxMessageChars: env.MAX_MESSAGE_CHARS,
  historyMessageCap: env.HISTORY_MESSAGE_CAP,
};
