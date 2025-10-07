import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'voice-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Voice Service API',
    status: 'running',
    endpoints: ['/health']
  });
});

app.listen(PORT, () => {
  console.log(`Voice service running on port ${PORT}`);
});
