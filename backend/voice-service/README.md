# Voice Service - ElevenLabs + DeepSeek Reasoning Integration

**Mission:** Proxy ElevenLabs text-to-speech + DeepSeek reasoning queue for voice mode interactions

## Architecture

```
Frontend (vibe-cockpit)
    ↓
Voice Service (Port 8080)
    ├─→ /api/elevenlabs/* → ElevenLabs API (TTS)
    └─→ /api/reasoning/* → BullMQ Queue → Reasoning Gateway (DeepSeek)
```

## Features

### ElevenLabs Integration

- **Text-to-Speech Synthesis** - Convert text to natural-sounding audio
- **Voice Management** - Get available voices and models
- **Streaming Support** - Stream audio directly to client
- **Voice Settings** - Customize stability and similarity boost

### Reasoning Queue Integration

- **Job Enqueue** - Submit prompts to DeepSeek reasoning gateway
- **SSE Streaming** - Real-time progress updates via Server-Sent Events
- **Job Management** - Check status, cancel jobs, get results
- **Queue Statistics** - Monitor queue health and performance

## API Endpoints

### ElevenLabs Endpoints

#### POST `/api/elevenlabs/synthesize`

Synthesize speech from text

**Request:**

```json
{
  "text": "Hello, this is a test",
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "modelId": "eleven_monolingual_v1",
  "voiceSettings": {
    "stability": 0.5,
    "similarityBoost": 0.75
  }
}
```

**Response:** Audio stream (audio/mpeg)

#### GET `/api/elevenlabs/voices`

Get list of available voices

**Response:**

```json
{
  "success": true,
  "voices": [...]
}
```

#### GET `/api/elevenlabs/models`

Get list of available models

**Response:**

```json
{
  "success": true,
  "models": [...]
}
```

### Reasoning Endpoints

#### POST `/api/reasoning/enqueue`

Enqueue a reasoning job

**Request:**

```json
{
  "prompt": "Explain quantum computing in simple terms",
  "userId": "user-123",
  "sessionId": "session-456",
  "metadata": {
    "context": "educational"
  }
}
```

**Response:**

```json
{
  "success": true,
  "jobId": "job-789",
  "queueName": "voice-mode-reasoning-jobs",
  "estimatedProcessingTime": "10-30 seconds"
}
```

#### GET `/api/reasoning/result/:jobId`

Get result of a reasoning job

**Response:**

```json
{
  "success": true,
  "jobId": "job-789",
  "state": "completed",
  "result": "Quantum computing is...",
  "progress": 100
}
```

#### GET `/api/reasoning/stream/:jobId`

Stream job progress via SSE

**Response:** Server-Sent Events stream

```
data: {"type":"connected","jobId":"job-789"}

data: {"type":"progress","progress":25}

data: {"type":"completed","result":"..."}
```

#### POST `/api/reasoning/cancel`

Cancel a reasoning job

**Request:**

```json
{
  "jobId": "job-789"
}
```

#### GET `/api/reasoning/queue/stats`

Get queue statistics

**Response:**

```json
{
  "success": true,
  "stats": {
    "waiting": 5,
    "active": 2,
    "completed": 100,
    "failed": 1,
    "total": 108
  }
}
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Required variables:

- `ELEVENLABS_API_KEY` - Get from <https://elevenlabs.io/>
- `REDIS_HOST` - Redis server for BullMQ (default: localhost)
- `REASONING_GATEWAY_BASE_URL` - Reasoning gateway URL (default: <http://localhost:4002>)

### 3. Start Redis

```bash
# macOS
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Run Service

```bash
# Development
npm run dev

# Production
npm start
```

Service runs on port 8080 by default.

## Deployment

### Docker

```bash
docker build -t voice-service .
docker run -p 8080:8080 --env-file .env voice-service
```

### Cloud Run

```bash
./deploy.sh
```

## ADR Reference

See `docs/adr/1.6.2.1_3-6-1-5_ADR_002_Voice_Queue_Architecture_20251006.md` for:

- BullMQ + Redis isolation
- JWT & guardrails
- Memory & feedback hooks
- SSE streaming implementation
- Logging & observability

## Testing

### Health Check

```bash
curl http://localhost:8080/health
```

### ElevenLabs Test

```bash
curl -X POST http://localhost:8080/api/elevenlabs/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}' \
  --output test.mp3
```

### Reasoning Test

```bash
# Enqueue job
curl -X POST http://localhost:8080/api/reasoning/enqueue \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is 2+2?"}'

# Get result (use jobId from above)
curl http://localhost:8080/api/reasoning/result/job-123

# Stream progress
curl -N http://localhost:8080/api/reasoning/stream/job-123
```

## Frontend Integration

### useReasoningJob Hook

```javascript
import { useState, useEffect } from 'react';

function useReasoningJob(prompt) {
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Enqueue job
    fetch('/api/reasoning/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    .then(res => res.json())
    .then(data => setJobId(data.jobId));
  }, [prompt]);

  useEffect(() => {
    if (!jobId) return;

    // Stream progress
    const eventSource = new EventSource(`/api/reasoning/stream/${jobId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'progress') {
        setProgress(data.progress);
      } else if (data.type === 'completed') {
        setResult(data.result);
        eventSource.close();
      }
    };

    return () => eventSource.close();
  }, [jobId]);

  return { jobId, result, progress };
}
```

## Support

Contact: <jesse@reggieanddro.com>

## License

Proprietary - Reggie & Dro Cannabis Store
