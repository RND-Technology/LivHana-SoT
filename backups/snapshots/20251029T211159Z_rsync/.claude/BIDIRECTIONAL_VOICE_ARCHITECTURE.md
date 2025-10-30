# Bidirectional Voice Architecture - True Interruption Capable
**Date:** 2025-10-29
**Goal:** ChatGPT Advanced Voice Mode quality with zero latency and instant interruption

---

## Current Limitation

**MCP Voice Mode (Sequential):**
```
User speaks → STT → Process → TTS generates → Play complete → Listen
```

**Problem:** Cannot interrupt during TTS playback. Must wait for complete response.

---

## Target Architecture (Simultaneous)

**True Bidirectional:**
```
┌─────────────────┐
│   WebSocket     │ ←→ Continuous connection
│   Voice Server  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│  STT  │ │  TTS  │  ← Parallel streams
│Stream │ │Stream │
└───┬───┘ └──┬────┘
    │        │
    ▼        ▼
 Always    Chunks
Listening Playing
```

**Key Features:**
1. **Parallel Processing:** STT and TTS run simultaneously
2. **Chunk-Based TTS:** Audio generated and played in small chunks
3. **Instant Cutoff:** STT detects voice → kills TTS immediately
4. **Zero Latency:** WebSocket keeps connection warm

---

## Implementation Plan

### Phase 1: WebSocket Voice Server (2 hours)
**File:** `backend/voice-realtime-service/src/index.ts`

```typescript
import { WebSocketServer } from 'ws';
import { Readable } from 'stream';

interface VoiceSession {
  ws: WebSocket;
  sttStream: Readable;  // Continuous STT
  ttsStream: Readable;  // Chunked TTS
  isSpeaking: boolean;  // User is speaking
  isPlaying: boolean;   // AI is playing audio
}

class BiDirectionalVoiceServer {
  private sessions: Map<string, VoiceSession>;

  // STT detects voice → interrupt TTS
  onUserSpeechStart(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session.isPlaying) {
      session.ttsStream.destroy();  // Kill audio immediately
      session.isPlaying = false;
    }
    session.isSpeaking = true;
  }

  // TTS plays in chunks, can be stopped anytime
  async streamTTS(sessionId: string, text: string) {
    const session = this.sessions.get(sessionId);
    session.isPlaying = true;

    // Generate audio in 200ms chunks
    for await (const chunk of this.generateTTSChunks(text)) {
      if (session.isSpeaking) {
        // User started speaking, stop immediately
        break;
      }
      session.ws.send(chunk);  // Send audio chunk to client
      await this.sleep(200);
    }

    session.isPlaying = false;
  }

  // Continuous STT monitoring
  async monitorSTT(sessionId: string) {
    const session = this.sessions.get(sessionId);

    for await (const audio of session.sttStream) {
      const transcript = await this.whisperSTT(audio);

      if (transcript.length > 0) {
        this.onUserSpeechStart(sessionId);
        // Process user input...
      }
    }
  }
}
```

### Phase 2: Client-Side Integration (1 hour)
**File:** `frontend/vibe-cockpit/src/voice/bidirectional-client.ts`

```typescript
class BiDirectionalVoiceClient {
  private ws: WebSocket;
  private micStream: MediaStream;
  private audioContext: AudioContext;

  async connect() {
    this.ws = new WebSocket('ws://localhost:3008/voice');

    // Send microphone audio continuously
    const audioTrack = this.micStream.getAudioTracks()[0];
    const mediaRecorder = new MediaRecorder(audioTrack);

    mediaRecorder.ondataavailable = (event) => {
      this.ws.send(event.data);  // Stream mic to server
    };

    // Receive and play audio chunks
    this.ws.onmessage = (event) => {
      this.playAudioChunk(event.data);
    };
  }

  playAudioChunk(chunk: ArrayBuffer) {
    // Play immediately, can be interrupted
    const source = this.audioContext.createBufferSource();
    source.buffer = this.decodeAudioData(chunk);
    source.connect(this.audioContext.destination);
    source.start();
  }
}
```

### Phase 3: Claude Integration (1 hour)
**File:** `backend/voice-realtime-service/src/claude-integration.ts`

```typescript
interface ClaudeVoiceConfig {
  enableInterruption: true;
  chunkSize: 200;  // ms per TTS chunk
  vadSensitivity: 0;  // Maximum interruption sensitivity
}

async function processUserInput(
  transcript: string,
  session: VoiceSession
): Promise<void> {
  // Stream Claude's response in real-time
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4',
    messages: [{ role: 'user', content: transcript }],
    stream: true
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      const text = chunk.delta.text;

      // Generate TTS for this text chunk
      await streamTTS(session.id, text);

      // If user interrupts, stream automatically stops
      if (session.isSpeaking) break;
    }
  }
}
```

---

## Technical Stack

### STT (Speech-to-Text)
- **Engine:** Whisper (localhost:2022) - already running
- **Latency:** ~200ms
- **Continuous:** Yes, always listening

### TTS (Text-to-Speech)
- **Engine:** Kokoro (localhost:8880) - already running
- **Latency:** ~100ms per chunk
- **Streaming:** Yes, chunk-based generation

### WebSocket Server
- **Port:** 3008
- **Protocol:** Binary audio frames
- **Connection:** Persistent, always-on

### Audio Processing
- **Format:** 16-bit PCM, 16kHz
- **Chunk Size:** 200ms (3,200 samples)
- **Latency Target:** <300ms end-to-end

---

## Deployment Steps

### Step 1: Create Voice Realtime Service
```bash
cd backend
mkdir voice-realtime-service
cd voice-realtime-service
npm init -y
npm install ws @anthropic-ai/sdk stream
```

### Step 2: Implement Server
```bash
# Create server file
touch src/index.ts
# Add code from Phase 1 above
```

### Step 3: Add to START.sh
```bash
# Add to orchestration startup
echo "Starting voice realtime service..."
tmux new-session -d -s voice-realtime "cd backend/voice-realtime-service && npm start"
```

### Step 4: Test Interruption
```bash
# Test script
node test/interrupt-test.js
# Expected: AI stops mid-sentence when user speaks
```

---

## Performance Targets

| Metric | Target | Current (MCP) | New (WebSocket) |
|--------|--------|---------------|-----------------|
| Interruption Latency | <100ms | N/A (sequential) | <100ms |
| TTS Start Latency | <200ms | ~500ms | <200ms |
| STT Accuracy | >95% | 95% | 95% |
| Connection Overhead | <50ms | ~1s per turn | <50ms |
| Simultaneous Streams | Yes | No | Yes |

---

## Fallacy Elimination

### ❌ Old Promise (False):
"I can be elastic and interruptible with current architecture"

### ✅ New Reality:
"Current MCP voice mode is sequential. Building true bidirectional system with WebSocket architecture for instant interruption."

### ❌ Old Behavior:
- Speak complete response
- Then listen
- Cannot interrupt

### ✅ New Behavior:
- Listen WHILE speaking
- Interrupt anytime
- Zero latency switching

---

## Timeline

- **Phase 1 (Server):** 2 hours
- **Phase 2 (Client):** 1 hour
- **Phase 3 (Integration):** 1 hour
- **Testing:** 1 hour
- **Total:** 5 hours to production

**Start:** Now
**Completion:** Today (2025-10-29 by 13:00)

---

## Next Steps

1. ✅ Document architecture (this file)
2. Create `backend/voice-realtime-service/` directory
3. Implement WebSocket server with parallel streams
4. Test interruption capability
5. Deploy to production
6. Replace MCP voice mode with new system

---

**Status:** Architecture complete. Ready to implement.
**Approval:** Waiting for green light to build.
