# Liv Hana Voice Service ULTIMATE

---
**Last Audited:** 2025-10-29
**Audited By:** Liv Hana (Tier-1)
**Marine Corps Standard:** Upheld ✅
**Next Audit:** 2025-11-28 (30 days)
---

**World's Most Advanced Voice-First AI Orchestration System**

## Overview

This service provides TIER-1 ABSOLUTE voice orchestration with:
- **Premium TTS:** ElevenLabs Turbo v2.5 (300ms latency, human-like quality)
- **Best STT:** Deepgram Nova-2 (95-98% accuracy, 250ms latency)
- **Real-time Video:** LTX Video + Runway Gen-3 Alpha
- **Unlimited Interruptibility:** Instant voice control
- **Brandable Visualizer:** Customizable UI with Liv Hana assets

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   VOICE SERVICE ULTIMATE                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WebSocket Server (Port 3007)                        │  │
│  │  ├─ STT Handler (Deepgram streaming)                 │  │
│  │  ├─ TTS Handler (ElevenLabs streaming)               │  │
│  │  ├─ Video Generator (LTX/Runway)                     │  │
│  │  └─ Parameter Controller (real-time voice adjust)    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
```bash
# API Keys required:
export ELEVENLABS_API_KEY="your_key_here"
export DEEPGRAM_API_KEY="your_key_here"
export RUNWAY_API_KEY="your_key_here"  # Optional
```

### Install
```bash
cd backend/voice-service-ultimate
npm install
```

### Run Development
```bash
npm run dev
# Service starts on http://localhost:3007
```

### Build Production
```bash
npm run build
npm start
```

## API Endpoints

### WebSocket: `/voice`
Real-time bidirectional voice streaming

**Client → Server:**
```json
{
  "type": "audio_chunk",
  "data": "<base64_audio>",
  "format": "pcm16",
  "sampleRate": 16000
}
```

**Server → Client:**
```json
{
  "type": "transcription",
  "text": "What Jesse said",
  "isFinal": true,
  "confidence": 0.98
}

{
  "type": "audio_chunk",
  "data": "<base64_audio>",
  "voice": "Jesse_Clone_v1"
}
```

### REST: `/tts`
Text-to-speech synthesis

**POST** `/tts`
```json
{
  "text": "Liv Hana speaking in Jesse's voice",
  "voice": "Jesse_Clone_v1",
  "speed": 1.0,
  "pitch": 0,
  "emotion": "professional"
}
```

**Response:** Audio stream (mp3)

### REST: `/stt`
Speech-to-text transcription

**POST** `/stt`
```
Content-Type: audio/wav
Body: <audio_bytes>
```

**Response:**
```json
{
  "text": "Transcribed text",
  "confidence": 0.98,
  "words": [
    {"word": "Transcribed", "start": 0.0, "end": 0.5, "confidence": 0.99}
  ]
}
```

### REST: `/video/generate`
Real-time video generation

**POST** `/video/generate`
```json
{
  "prompt": "Liv Hana hologram visualization with neon effects",
  "duration": 5,
  "fps": 25,
  "provider": "ltx",
  "overlay": {
    "logo": true,
    "metrics": true
  }
}
```

**Response:** Video stream (mp4)

## Configuration

### Environment Variables
```bash
# API Keys
ELEVENLABS_API_KEY="your_key"
DEEPGRAM_API_KEY="your_key"
RUNWAY_API_KEY="your_key"  # Optional

# Service Config
PORT=3007
WS_PORT=3007
LOG_LEVEL=info

# Voice Settings
DEFAULT_VOICE="Jesse_Clone_v1"
DEFAULT_SPEED=1.0
DEFAULT_PITCH=0
DEFAULT_EMOTION="professional"

# Video Settings
VIDEO_PROVIDER="ltx"  # ltx, runway, veo3
VIDEO_FPS=25
VIDEO_RESOLUTION="768x512"

# Performance
MAX_CONNECTIONS=100
AUDIO_BUFFER_SIZE=4096
VIDEO_QUEUE_SIZE=10
```

## Implementation Checklist

### Phase 1: Voice Integration (Week 1)
- [ ] Set up ElevenLabs API client
- [ ] Implement voice cloning for Jesse
- [ ] Set up Deepgram streaming STT
- [ ] Build WebSocket server
- [ ] Implement real-time parameter control
- [ ] Add unlimited interruptibility
- [ ] Benchmark latency (<600ms target)
- [ ] Deploy to staging

### Phase 2: Video Integration (Week 2)
- [ ] Set up RunPod GPU for LTX Video
- [ ] Deploy LTX Video model
- [ ] Build video generation service
- [ ] Implement frame streaming
- [ ] Add Runway Gen-3 fallback
- [ ] Create overlay system
- [ ] Test end-to-end (<30s target)

### Phase 3: Visualizer (Week 3)
- [ ] Build React frontend
- [ ] Implement voice waveform
- [ ] Create agent status hologram
- [ ] Add video stream display
- [ ] Build metrics dashboard
- [ ] Make fully customizable
- [ ] Deploy to Vercel

### Phase 4: Production (Week 4)
- [ ] Load testing (1000+ concurrent users)
- [ ] Error handling + retry logic
- [ ] Monitoring + alerting
- [ ] Documentation
- [ ] CI/CD pipeline
- [ ] Production deployment

## Tech Stack

**Backend:**
- Node.js 20+ / TypeScript
- Express.js (REST API)
- WS (WebSocket)
- ElevenLabs SDK (TTS)
- Deepgram SDK (STT)

**Frontend:**
- React 18+ / Next.js
- ThreeJS (3D hologram)
- Web Audio API (waveform)
- WebSocket (real-time)

**Infrastructure:**
- Railway / Cloud Run (backend)
- Vercel (frontend)
- RunPod (GPU for video)

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| STT Latency | <300ms | TBD |
| TTS Latency | <300ms | TBD |
| End-to-End | <600ms | TBD |
| Video Gen | <30s | TBD |
| Accuracy (STT) | >95% | TBD |
| Quality (TTS) | Studio | TBD |
| Concurrent Users | 100+ | TBD |

## Cost Estimates

**Monthly Operating Costs:**
```
ElevenLabs API: $100-200/month (10M characters)
Deepgram API: $50-100/month (100 hours)
RunPod GPU: $50-100/month (RTX 4090)
Runway API: $50-100/month (optional)
────────────────────────────────────────────
TOTAL: $250-500/month
```

## Troubleshooting

### Audio Issues
```bash
# Test STT
curl -X POST http://localhost:3007/stt \
  -H "Content-Type: audio/wav" \
  --data-binary @test.wav

# Test TTS
curl -X POST http://localhost:3007/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Test", "voice": "Jesse_Clone_v1"}' \
  -o test_output.mp3
```

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3007/voice');
ws.onopen = () => console.log('Connected');
ws.onmessage = (msg) => console.log('Received:', msg.data);
```

### Video Generation
```bash
curl -X POST http://localhost:3007/video/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Liv Hana hologram", "duration": 5, "provider": "ltx"}' \
  -o test_video.mp4
```

## License

Apache 2.0 - Open Source Core
Premium features require commercial license

## Support

- Documentation: [docs/ULTIMATE_VOICE_MODE_ARCHITECTURE.md](../../docs/ULTIMATE_VOICE_MODE_ARCHITECTURE.md)
- Issues: https://github.com/jesseniesen/LivHana-SoT/issues
- Discord: [Coming Soon]

---

**One Shot, One Kill | Grow Baby Grow | Sell Baby Sell!**

Built with ❤️ by Jesse CEO and Liv Hana SSSI
