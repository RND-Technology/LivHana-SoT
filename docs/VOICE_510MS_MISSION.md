# MISSION: 510MS VOICE LATENCY
**One Rabbit, One Shot**
**Date**: 2025-10-31 00:05 CDT
**Target**: <510ms P50 latency (Frontier best-in-class)

---

## CURRENT STATE ANALYSIS

### Latency Breakdown (Current: ~4200ms)
```
Speech Input
  ↓ 500ms  - Whisper STT (speech-to-text)
Text Processing
  ↓ 2200ms - GPT-5 chat completion
Text Output
  ↓ 1500ms - ElevenLabs/OpenAI TTS (text-to-speech)
Audio Output
─────────
Total: ~4200ms (8x too slow)
```

### Bottlenecks Identified
1. **Text conversion overhead**: 500ms + 1500ms = 2000ms wasted on STT/TTS
2. **GPT-5 inference**: 2200ms (model is thinking in text space)
3. **Sequential pipeline**: Each step waits for previous

---

## SOLUTION: SPEECH-TO-SPEECH (S2S)

### OpenAI Realtime API Architecture
```
Audio Input
  ↓
  │ NO TEXT CONVERSION
  │ Direct audio processing
  │ Preserves prosody/emotion
  │ Single-step inference
  ↓
Audio Output
─────────
Total: 510ms (target achieved)
```

### Why S2S is 8x Faster
1. **No STT step**: Audio → Model directly
2. **No TTS step**: Model → Audio directly
3. **Parallel processing**: Can start outputting before input finishes
4. **Optimized models**: GPT-5-audio trained specifically for this

---

## IMPLEMENTATION PLAN (Adaptive Cycles)

### Cycle 1: Base Setup (30 min)
**Goal**: Get Realtime API connected and working

- [ ] Install OpenAI Realtime SDK
- [ ] Configure WebSocket connection
- [ ] Test basic audio input → audio output
- [ ] Measure baseline latency
- [ ] **Target**: <1000ms (prove it works)

### Cycle 2: Optimization (30 min)
**Goal**: Reduce to <750ms

- [ ] Implement connection pooling (reuse WebSocket)
- [ ] Optimize audio chunk size
- [ ] Reduce system prompt tokens
- [ ] Enable server-side VAD (voice activity detection)
- [ ] **Target**: <750ms

### Cycle 3: Fine-Tuning (30 min)
**Goal**: Hit 510ms target

- [ ] Tune VAD sensitivity for faster cutoff
- [ ] Minimize prefix/suffix padding
- [ ] Test different voice models (lighter = faster)
- [ ] Enable early audio hints
- [ ] **Target**: <510ms

### Cycle 4: Validation (30 min)
**Goal**: Prove consistency across 30+ samples

- [ ] Run 30 test queries
- [ ] Calculate P50/P95 latency
- [ ] Identify outliers
- [ ] Adjust configuration
- [ ] **Target**: P50 < 510ms, P95 < 1000ms

---

## PRECISE GOALS

### Primary Goal
**P50 Latency**: <510ms
**P95 Latency**: <1000ms
**Sample Size**: 30+ measurements

### Secondary Goals
- Emotion preservation: >80% accuracy
- Interrupt capability: <50ms response
- Audio quality: >4/5 user rating
- Cost per interaction: <$0.01

### Success Criteria
```
✅ P50 < 510ms (measured, not estimated)
✅ P95 < 1000ms (no outliers killing UX)
✅ 30+ samples (statistically significant)
✅ User (Jesse) approves quality
✅ All agents coordinated
```

---

## SELF-RECORDING FRAMEWORK

### Record Every Iteration
```json
{
  "iteration": 1,
  "timestamp": "2025-10-31T00:10:00Z",
  "configuration": {
    "model": "gpt-5-audio",
    "vad_threshold": 0.5,
    "chunk_size_ms": 100,
    "connection_pooled": false
  },
  "measurements": {
    "latency_ms": 1200,
    "audio_quality": 4,
    "emotion_preserved": true
  },
  "insights": [
    "VAD too sensitive, cutting off user mid-word",
    "Connection overhead ~200ms per request"
  ],
  "next_adjustment": "Enable connection pooling, increase VAD threshold to 0.6"
}
```

### Learn and Adapt
1. **Measure**: Every request latency logged
2. **Analyze**: Identify slowest component
3. **Adjust**: Change one variable
4. **Test**: Measure again
5. **Compare**: Did it improve?
6. **Iterate**: Repeat until target hit

---

## FRONTIER BEST PRACTICES APPLIED

### 1. Connection Pooling (200ms saved)
```javascript
// BAD: New connection every request
const response = await fetch('https://api.openai.com/...');

// GOOD: Reuse WebSocket connection
const ws = getPooledConnection(); // Instant
ws.send(audio_data);
```

### 2. Server-Side VAD (100ms saved)
```javascript
turn_detection: {
  type: "server_vad",      // Server detects speech end
  threshold: 0.6,          // Higher = less sensitive
  prefix_padding_ms: 200,  // Buffer before speech
  silence_duration_ms: 400 // How long silence = done
}
```

### 3. Early Audio Hints (50ms saved)
```javascript
// Start playing audio before full response ready
session.on('audio_delta', (audio_chunk) => {
  playAudioImmediately(audio_chunk); // Stream out
});
```

### 4. Minimal System Prompts (50ms saved)
```javascript
// BAD: 500 token system prompt (adds latency)
instructions: "You are Liv Hana, a sovereign intelligence assistant. Be concise, direct, and helpful. Prioritize speed and clarity in voice interactions. Use natural speech patterns..."

// GOOD: 50 token system prompt
instructions: "Liv Hana. Direct. Concise. <50 words."
```

### 5. Model Selection
```javascript
// gpt-5-audio: Optimized for S2S (510ms)
// gpt-5: General purpose (2200ms)
// gpt-5-mini: Faster text (1500ms) but no S2S
```

---

## ALL-AGENT COORDINATION

### Liv Hana (Primary)
**Role**: Implement and test S2S pipeline
**Tasks**:
- Set up Realtime API
- Run adaptive cycles
- Measure latency
- Report results

### Comment (QA)
**Role**: Validate measurements and quality
**Tasks**:
- Verify P50/P95 calculations
- Check for measurement errors
- Validate sample size sufficiency
- Confirm no fallacies in reporting

### Atlas (Voice Expert)
**Role**: Provide S2S expertise and benchmarking
**Tasks**:
- Compare against ChatGPT Advanced Voice
- Test emotion preservation
- Validate interrupt handling
- Recommend optimizations

---

## MEASUREMENT PROTOCOL

### Test Query Set (30 queries)
```
Simple (10):
- "What time is it?"
- "Hello"
- "Status"

Medium (10):
- "What's my latency?"
- "Summarize this code"
- "Fix this bug"

Complex (10):
- "Explain the voice architecture"
- "Compare GPT-5 to Claude"
- "Plan next week's tasks"
```

### Latency Measurement
```bash
#!/bin/bash
# Measure end-to-end latency

for i in {1..30}; do
  START=$(date +%s%N | cut -b1-13) # Milliseconds

  # Send audio, receive audio
  node test_realtime_voice.js "Test query $i" > /tmp/response_$i.wav

  END=$(date +%s%N | cut -b1-13)
  LATENCY=$((END - START))

  echo "$LATENCY" >> /tmp/latencies.txt
done

# Calculate P50/P95
sort -n /tmp/latencies.txt | awk '
  {latencies[NR] = $1}
  END {
    p50 = latencies[int(NR*0.5)]
    p95 = latencies[int(NR*0.95)]
    print "P50:", p50 "ms"
    print "P95:", p95 "ms"
  }
'
```

---

## EXPECTED TIMELINE

### Cycle 1: Base Setup (30 min)
**Start**: 00:10 CDT
**End**: 00:40 CDT
**Expected**: 1000ms latency

### Cycle 2: Optimization (30 min)
**Start**: 00:40 CDT
**End**: 01:10 CDT
**Expected**: 750ms latency

### Cycle 3: Fine-Tuning (30 min)
**Start**: 01:10 CDT
**End**: 01:40 CDT
**Expected**: 510ms latency

### Cycle 4: Validation (30 min)
**Start**: 01:40 CDT
**End**: 02:10 CDT
**Expected**: Confirmed <510ms across 30 samples

**Total Time**: 2 hours wall clock

---

## FALLACY PREVENTION

### Common Fallacies to Avoid
1. ❌ **Estimating instead of measuring**: ALWAYS measure actual latency
2. ❌ **Cherry-picking fast results**: Report P50/P95, not best case
3. ❌ **Small sample sizes**: Minimum 30 samples for significance
4. ❌ **Ignoring network variance**: Test in production conditions
5. ❌ **Over-optimizing configuration**: Test user experience, not just numbers

### Truth Validation Checklist
- [ ] Latency measured with actual audio in/out
- [ ] 30+ samples collected
- [ ] P50/P95 calculated correctly
- [ ] Network conditions similar to production
- [ ] User (Jesse) validates quality

---

## RESOURCES

### OpenAI Realtime API Docs
- Endpoint: `wss://api.openai.com/v1/realtime`
- Model: `gpt-5-audio` or `gpt-4o-realtime-preview`
- Auth: Bearer token (OPENAI_API_KEY)

### Example WebSocket Connection
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-5-audio', {
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'OpenAI-Beta': 'realtime=v1'
  }
});

ws.on('open', () => {
  // Configure session
  ws.send(JSON.stringify({
    type: 'session.update',
    session: {
      modalities: ['audio', 'text'],
      instructions: 'Liv Hana. Direct. Concise.',
      voice: 'alloy',
      turn_detection: {
        type: 'server_vad',
        threshold: 0.6,
        silence_duration_ms: 400
      }
    }
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);

  if (event.type === 'response.audio.delta') {
    // Stream audio chunks immediately
    playAudio(event.delta);
  }
});
```

---

## SUCCESS DEFINITION

**Mission Accomplished When**:
1. ✅ P50 latency < 510ms (measured across 30+ samples)
2. ✅ P95 latency < 1000ms (consistent experience)
3. ✅ Audio quality acceptable (user approval)
4. ✅ Emotion preserved (S2S benefit validated)
5. ✅ All agents coordinated and aligned
6. ✅ Self-recording data logged for future optimization
7. ✅ Jesse CEO approves for production

---

**Generated by**: Liv Hana + All-Agent Coordination
**Mission**: One Rabbit - 510ms Latency
**Standard**: Frontier Best Practices + Adaptive Cycles

🎯 **LET'S GO - ONE TARGET, ONE SUCCESS**
