import 'dotenv/config';
import { sendMessage, getHistory } from '../src/services/chatService.js';

async function main() {
  console.log('--- Test 1: new conversation ---');
  const { reply: r1, sessionId } = await sendMessage("What's your return policy?");
  console.log('Session:', sessionId);
  console.log('Reply:', r1);

  console.log('\n--- Test 2: continue same session ---');
  const { reply: r2 } = await sendMessage('What about personal care items?', sessionId);
  console.log('Reply:', r2);

  console.log('\n--- Test 3: unknown sessionId creates new conversation ---');
  const { sessionId: newId } = await sendMessage('Hello', '00000000-0000-0000-0000-000000000000');
  console.log('New session (different from original):', newId !== sessionId);

  console.log('\n--- Test 4: history of original session ---');
  const history = await getHistory(sessionId);
  console.log(`${history.length} messages:`);
  for (const m of history) {
    console.log(`  [${m.sender}] ${m.text.slice(0, 70)}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
