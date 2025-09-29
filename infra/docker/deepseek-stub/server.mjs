import express from 'express';

const app = express();
app.use(express.json());

app.post('/v1/responses', (req, res) => {
  res.status(200).json({
    id: 'stub-response',
    choices: [
      {
        finish_reason: 'stop',
        message: {
          role: 'assistant',
          content: 'stubbed reasoning output',
        },
      },
    ],
  });
});

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`Deepseek stub listening on port ${port}`);
});
