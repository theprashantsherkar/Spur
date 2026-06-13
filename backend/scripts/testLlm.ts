import 'dotenv/config';
import { createProvider } from '../src/llm/index.js';

const questions = [
  "What's your return policy?",
  "How long does shipping to the USA take?",
  "Can I return a personal care item?",
];

async function main() {
  const llm = createProvider();

  for (const q of questions) {
    console.log(`\nQ: ${q}`);
    const reply = await llm.generateReply([], q);
    console.log(`A: ${reply}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
