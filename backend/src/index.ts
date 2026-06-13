import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env['PORT'] ?? 8080;
const corsOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
