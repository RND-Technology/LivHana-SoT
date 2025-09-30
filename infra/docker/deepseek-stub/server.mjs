import express from 'express';

const app = express();
app.use(express.json());

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', (req, res) => {
  const { messages, stream } = req.body;
  const userMessage = messages?.find(m => m.role === 'user')?.content || 'Hello';
  
  if (stream) {
    // Stream response in OpenAI format
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const response = `Hello! I'm Liv Hana, your AI assistant. You said: "${userMessage}". I'm running locally on your M4 Max via DeepSeek stub. How can I help you today?`;
    
    // Send chunks
    const chunks = response.match(/.{1,10}/g) || [response];
    chunks.forEach((chunk, i) => {
      const data = {
        id: 'chatcmpl-stub',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'deepseek-chat',
        choices: [{
          index: 0,
          delta: { content: chunk },
          finish_reason: i === chunks.length - 1 ? 'stop' : null
        }]
      };
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
    
    res.write('data: [DONE]\n\n');
    res.end();
  } else {
    // Non-streaming response
    res.status(200).json({
      id: 'chatcmpl-stub',
      object: 'chat.completion',
      created: Date.now(),
      model: 'deepseek-chat',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: `Hello! I'm Liv Hana. You said: "${userMessage}". I'm here to help!`
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    });
  }
});

// Legacy responses endpoint (deprecated)
app.post('/v1/responses', (req, res) => {
  res.status(200).json({
    id: 'stub-response',
    choices: [{
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: 'Hello! I\'m Liv Hana running in stub mode.'
      }
    }]
  });
});

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'deepseek-stub', model: 'local' });
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`Deepseek stub listening on port ${port}`);
});
