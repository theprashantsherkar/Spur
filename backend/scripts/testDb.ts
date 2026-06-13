import 'dotenv/config';
import { createConversation, addMessage, getMessages } from '../src/db/repository.js';

async function main() {
  console.log('Creating conversation...');
  const sessionId = await createConversation();
  console.log('Session ID:', sessionId);

  console.log('\nInserting messages...');
  await addMessage(sessionId, 'user', 'What is your return policy?');
  await addMessage(sessionId, 'ai', 'We offer a 30-day return window for unused items.');

  console.log('\nFetching messages...');
  const msgs = await getMessages(sessionId);
  console.log(`Retrieved ${msgs.length} message(s):`);
  for (const m of msgs) {
    console.log(`  [${m.sender}] ${m.text}`);
  }

  console.log('\nDone.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
