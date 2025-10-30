# Voice Mode Optimization Guide for Claude Code & MCP VoiceMode

## Executive Summary

This guide consolidates expert community feedback and best practices for optimizing voice mode parameters in Claude Code using MCP VoiceMode. Voice mode enables natural, hands-free conversations with AI assistants at speeds 3x faster than typing.

**Current Status**: Native voice mode is not officially available in Claude Code (as of January 2025), but third-party MCP integration via `mbailey/voicemode` provides production-ready voice capabilities.

---

## Table of Contents

1. [Key Parameters Overview](#key-parameters-overview)
2. [Optimal Configuration Settings](#optimal-configuration-settings)
3. [Voice Activity Detection (VAD) Tuning](#voice-activity-detection-vad-tuning)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Expert Community Recommendations](#expert-community-recommendations)
6. [Production Deployment Checklist](#production-deployment-checklist)

---

## Key Parameters Overview

### Core Voice Interaction Parameters

| Parameter | Type | Default | Impact on Performance |
|-----------|------|---------|----------------------|
| `wait_for_response` | boolean | true | Enables bidirectional conversation flow |
| `listen_duration_max` | number | 120s | Maximum recording time before timeout |
| `listen_duration_min` | number | 2.0s | Minimum recording before silence detection activates |
| `vad_aggressiveness` | 0-3 | 2 | Controls voice detection sensitivity |
| `disable_silence_detection` | boolean | false | Override automatic speech endpoint detection |
| `speed` | 0.25-4.0 | 1.0 | TTS playback rate |

### Critical Timing Parameters

**VOICEMODE_SILENCE_DURATION** (default: 0.7s)
- Controls how long silence must persist before stopping recording
- **Too short**: Cuts off natural pauses, interrupts speakers mid-thought
- **Too long**: Adds latency, poor responsiveness
- **Recommended range**: 0.5-1.5s depending on speaking style

**VOICEMODE_MIN_SPEECH_DURATION** (default: 0.3s)
- Minimum utterance length to be considered valid speech
- Prevents false triggering from mouth noises or brief sounds
- **Recommended**: 0.2-0.5s for natural conversation

**VOICEMODE_CHUNK_DURATION** (default: 0.03s / 30ms)
- Audio buffer processing size
- Smaller = lower latency but higher CPU usage
- **Recommended**: 30ms frames for optimal balance

---

## Optimal Configuration Settings

### Production-Ready Configuration

```bash
# Required - OpenAI API Key (or compatible service)
export OPENAI_API_KEY="your-api-key-here"

# Speech-to-Text Optimization
export STT_MODEL="whisper-1"
export STT_LANGUAGE="en"  # Explicit language improves accuracy
export VOICEMODE_STT_AUDIO_FORMAT="mp3"  # Best for uploads
export VOICEMODE_WHISPER_MODEL="large-v2"  # For local Whisper

# Text-to-Speech Optimization
export TTS_MODEL="tts-1"  # Use tts-1-hd for higher quality
export TTS_VOICE="alloy"  # Options: alloy, echo, fable, onyx, nova, shimmer
export VOICEMODE_TTS_AUDIO_FORMAT="pcm"  # Zero latency, best streaming

# Audio Quality
export VOICEMODE_SAMPLE_RATE="16000"  # 16kHz recommended for speech
export VOICEMODE_CHANNELS="1"  # Mono for speech
export VOICEMODE_AUDIO_FORMAT="pcm"  # Global format

# VAD & Silence Detection (Natural Conversation Settings)
export VOICEMODE_VAD_MODE="2"  # Balanced aggressiveness (0=lenient, 3=strict)
export VOICEMODE_SILENCE_DURATION="0.7"  # Seconds of silence before stopping
export VOICEMODE_MIN_SPEECH_DURATION="0.3"  # Minimum valid utterance
export VOICEMODE_SILENCE_THRESHOLD="0.01"  # Audio level cutoff
export VOICEMODE_CHUNK_DURATION="0.03"  # 30ms frames

# Compression (if needed)
export VOICEMODE_MP3_BITRATE="64k"  # Balance quality/size
export VOICEMODE_OPUS_BITRATE="32000"  # Not recommended for streaming

# Debug & Development
export VOICEMODE_DEBUG="false"  # Set true for troubleshooting
export VOICEMODE_SAVE_AUDIO="false"  # Set true to archive audio
export VOICEMODE_SAVE_DIR="~/voicemode_audio/"

# Optional: Audio Feedback
export VOICE_MODE_AUDIO_FEEDBACK="true"
export VOICE_MODE_FEEDBACK_STYLE="whisper"  # or "shout"
```

### Alternative: Privacy-First Local Configuration

```bash
# Local Whisper STT (no OpenAI dependency)
export STT_BASE_URL="http://localhost:8000"
export VOICEMODE_WHISPER_MODEL="large-v3"

# Local Kokoro TTS (no OpenAI dependency)
export TTS_BASE_URL="http://localhost:8001"
export TTS_VOICE="af_sky"  # Kokoro voice options

# Same optimization parameters as above
export VOICEMODE_VAD_MODE="2"
export VOICEMODE_SILENCE_DURATION="0.7"
# ... (rest of settings)
```

---

## Voice Activity Detection (VAD) Tuning

### Understanding VAD Aggressiveness

Voice Activity Detection uses WebRTC VAD with aggressiveness levels 0-3:

| Level | Behavior | Best Use Case | Trade-offs |
|-------|----------|---------------|-----------|
| 0 | Very lenient | High background noise environments | May classify noise as voice |
| 1 | Relaxed | Natural conversation, low noise | Good balance, some false positives |
| 2 | Balanced | Production default | Optimal for most scenarios |
| 3 | Aggressive | Clean audio, minimal noise | May cut off soft speech or natural pauses |

### Expert Recommendations by Use Case

**Natural Conversational AI (Recommended: VAD Mode 1-2)**
```bash
export VOICEMODE_VAD_MODE="1"  # More forgiving
export VOICEMODE_SILENCE_DURATION="1.0"  # Longer pause tolerance
export VOICEMODE_MIN_SPEECH_DURATION="0.2"  # Capture brief utterances
```

**High-Noise Environments (Recommended: VAD Mode 2-3)**
```bash
export VOICEMODE_VAD_MODE="3"  # Stricter filtering
export VOICEMODE_SILENCE_THRESHOLD="0.02"  # Higher noise floor
export VOICEMODE_MIN_SPEECH_DURATION="0.4"  # Ignore brief noises
```

**Slow/Thoughtful Speakers (Recommended: VAD Mode 0-1)**
```bash
export VOICEMODE_VAD_MODE="0"  # Most lenient
export VOICEMODE_SILENCE_DURATION="1.5"  # Extended pause tolerance
export VOICEMODE_DISABLE_SILENCE_DETECTION="false"  # Keep enabled but relaxed
```

**Low-Latency Applications (Recommended: VAD Mode 2)**
```bash
export VOICEMODE_VAD_MODE="2"  # Standard
export VOICEMODE_SILENCE_DURATION="0.5"  # Shorter for responsiveness
export VOICEMODE_CHUNK_DURATION="0.02"  # 20ms frames for faster processing
```

### Technical VAD Implementation Details

VoiceMode uses WebRTC VAD which:
- Only accepts 16-bit mono PCM audio
- Supports sample rates: 8000, 16000, 32000, or 48000 Hz (16kHz recommended)
- Operates on frame durations: 10, 20, or 30ms (30ms recommended)
- Optimized for telephony but may detect music/typing as voice
- Cannot handle complex overlapped speech or non-stationary noise

**Critical Insight**: VAD should "fail-safe" (indicate speech when uncertain) to avoid losing speech segments, which is why mode 1-2 is preferred over mode 3 for natural conversation.

---

## Common Issues & Solutions

### Issue 1: Speech Gets Cut Off Mid-Sentence

**Symptoms**: Voice detection stops before you finish speaking, truncating sentences

**Root Causes**:
- VAD aggressiveness too high (mode 3)
- Silence duration too short
- Speaking with long natural pauses

**Solutions**:
```bash
# Reduce VAD aggressiveness
export VOICEMODE_VAD_MODE="1"  # Down from 2 or 3

# Increase silence tolerance
export VOICEMODE_SILENCE_DURATION="1.2"  # Up from 0.7

# Lower minimum speech duration
export VOICEMODE_MIN_SPEECH_DURATION="0.2"

# Add audio buffer padding
export VOICEMODE_AUDIO_BUFFER_SIZE="4096"  # Increase buffer
```

**Additional Technique**: Add "prefix padding" to capture first few milliseconds:
- Most implementations buffer the last 2 seconds of audio before speech starts
- Prevents missing initial phonemes

### Issue 2: Too Much Background Noise Detected as Speech

**Symptoms**: System keeps listening when no one is speaking, false triggers

**Root Causes**:
- VAD aggressiveness too low (mode 0)
- Silence threshold too low
- Minimum speech duration too short

**Solutions**:
```bash
# Increase VAD aggressiveness
export VOICEMODE_VAD_MODE="2"  # Up from 0 or 1

# Raise silence threshold
export VOICEMODE_SILENCE_THRESHOLD="0.02"  # Up from 0.01

# Increase minimum speech duration
export VOICEMODE_MIN_SPEECH_DURATION="0.4"  # Filter out brief sounds
```

### Issue 3: High Latency / Slow Response

**Symptoms**: Delay between speaking and system response, poor real-time feel

**Root Causes**:
- Network latency to OpenAI API
- Suboptimal audio format (Opus streaming)
- Large chunk durations

**Solutions**:
```bash
# Use PCM for zero-latency streaming
export VOICEMODE_TTS_AUDIO_FORMAT="pcm"

# Reduce chunk duration (careful: increases CPU)
export VOICEMODE_CHUNK_DURATION="0.02"  # 20ms frames

# Consider local services for lowest latency
export STT_BASE_URL="http://localhost:8000"
export TTS_BASE_URL="http://localhost:8001"

# Reduce silence duration for faster cutoff
export VOICEMODE_SILENCE_DURATION="0.5"  # Down from 0.7
```

**Performance Benchmarks**:
- OpenAI API: 232-320ms average response time
- Local Whisper.cpp + Kokoro: 50-150ms typical
- Network overhead: +50-200ms depending on connection

### Issue 4: No Microphone Access (WSL2)

**Symptoms**: `PortAudioError: Error querying device -1`, empty device list

**Root Cause**: WSL2 lacks native audio device support

**Solutions** (in order of preference):

1. **Enable WSL Audio Support (WSL 2.3.26.0+)**
```bash
sudo apt install -y libasound2-plugins pulseaudio
pactl list sources short  # Verify devices
export VOICEMODE_INPUT_DEVICE="0"  # Set specific device
```

2. **Use LiveKit Transport (Recommended)**
```bash
# Bypasses local microphone entirely
export LIVEKIT_URL="wss://your-livekit-server"
export LIVEKIT_API_KEY="your-api-key"
export LIVEKIT_API_SECRET="your-secret"
```

3. **USB Microphone via USB/IP**
```bash
# Windows side
usbipd list
usbipd attach --wsl --busid <BUSID>

# WSL side
lsusb  # Verify device
```

4. **Network PulseAudio (Higher Latency)**
```bash
# Windows: Configure PulseAudio TCP server
# WSL:
export PULSE_SERVER="tcp:$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')"
```

### Issue 5: Inconsistent Voice Quality / Audio Artifacts

**Symptoms**: Choppy audio, unexpected sounds, gibberish, quality degradation

**Root Causes**:
- Network instability
- Bandwidth limitations
- Suboptimal audio format
- TTS model limitations

**Solutions**:
```bash
# Use higher quality TTS model
export TTS_MODEL="tts-1-hd"  # Higher quality than tts-1

# Optimize audio format
export VOICEMODE_TTS_AUDIO_FORMAT="pcm"  # Uncompressed
export VOICEMODE_MP3_BITRATE="128k"  # If using MP3, increase bitrate

# Increase sample rate
export VOICEMODE_SAMPLE_RATE="24000"  # Up from 16000 (uses more bandwidth)

# Use multiple fallback providers
export TTS_BASE_URLS="https://api.openai.com/v1,http://localhost:8001"
```

**Known Limitation**: OpenAI Advanced Voice Mode occasionally produces:
- Unexpected tone/intonation changes
- Background music or ad-like sounds
- Gibberish output
- Not optimized for Bluetooth/speakerphone yet (January 2025)

### Issue 6: Voice Mode Stops Working / Connection Lost

**Symptoms**: Voice interactions fail after working initially

**Diagnostic Commands**:
```bash
# Check MCP connection
claude mcp list
claude mcp status voicemode

# Test audio devices
voicemode diag devices

# Test TTS and STT
voicemode converse

# Check service status (local services)
voicemode whisper status
voicemode kokoro status

# View logs
voicemode logs --tail 50
```

**Solutions**:
```bash
# Verify API key
echo $OPENAI_API_KEY  # Should show your key

# Enable debug mode
export VOICEMODE_DEBUG="true"
voicemode converse  # Run again to see detailed logs

# Check audio subsystem (Linux/WSL)
ps aux | grep pulse
python3 -m sounddevice  # List devices

# Force specific audio device
export VOICEMODE_INPUT_DEVICE="0"
export VOICEMODE_AUDIO_BUFFER_SIZE="4096"
```

---

## Expert Community Recommendations

### From GitHub Issues (anthropics/claude-code)

**Community Demand**: Multiple feature requests (#2116, #154, #1852) for native voice mode
- Users cite 3x speed improvement over typing
- Desire for hands-free coding during detailed prompts
- Request for VS Code Speech extension integration

**Current Status**: Not officially supported in Claude Code CLI (January 2025)
- Third-party MCP integration via `mbailey/voicemode` fills gap
- Community actively developing and sharing configurations

### From Voice Mode Documentation & Best Practices

**Continuous Conversation Flow**:
- Always use `wait_for_response: true` (default) for natural bidirectional conversations
- The `converse()` function is preferred over separate speak/listen calls
- Automatic silence detection eliminates need for push-to-talk

**Audio Format Selection**:
- **PCM**: Best for streaming TTS, zero latency, uncompressed (recommended)
- **MP3**: Best for uploading STT audio, configurable bitrate, good compression
- **Opus**: NOT recommended for streaming due to quality issues
- **WAV/FLAC**: Lossless alternatives, larger file sizes

**Transport Selection**:
- **Local**: Direct microphone access, lowest latency, requires audio subsystem
- **LiveKit**: Room-based communication, bypasses local audio issues, adds network latency
- **Auto** (default): Automatically selects best available transport

### From VAD Research & Speech Processing

**Fail-Safe Design Principle**:
> "In difficult detection conditions it is often preferable that a VAD should fail-safe, indicating speech detected when the decision is in doubt, to lower the chance of losing speech segments."

**Implications**:
- Prefer lower VAD aggressiveness (mode 1-2) for conversational AI
- Accept some false positives (noise detected as speech) to avoid missing real speech
- Use combination of VAD + energy-based detection for best results

**Hangover Timers**:
- Delay transition from speech to silence by 200-500ms
- Prevents choppy audio from brief pauses
- Already implemented in `VOICEMODE_SILENCE_DURATION` parameter

**Semantic VAD (Future Enhancement)**:
- Language-aware models that understand thought completion
- Distinguishes between mid-sentence pauses vs. statement endings
- Not yet available in current VoiceMode implementation

### From OpenAI Advanced Voice Mode Analysis

**Response Time Benchmarks**:
- Fastest: 232ms (human-like)
- Average: 320ms (near-human parity)
- Target: <300ms for natural conversation feel

**Real-World Usage Tips**:
- Speak clearly and at natural pace (not too fast or slow)
- Enable background conversations for multitasking
- Stable internet connection critical (affects quality and latency)
- Noise reduction features improve recognition accuracy

**Known Limitations**:
- Half-understood input can derail conversation in unexpected directions
- Interruption handling not always smooth
- Bluetooth/speakerphone optimization still in progress (as of 2025)

---

## Production Deployment Checklist

### Pre-Deployment Configuration

- [ ] **API Keys Configured**
  - [ ] `OPENAI_API_KEY` set or local services configured
  - [ ] Keys tested and verified working
  - [ ] Fallback providers configured (if applicable)

- [ ] **Audio System Verified**
  - [ ] Microphone permissions granted (System Preferences on macOS)
  - [ ] Audio devices detected: `voicemode diag devices`
  - [ ] PulseAudio/PipeWire running (Linux/WSL)
  - [ ] User added to audio group (Linux): `sudo usermod -aG audio $USER`

- [ ] **MCP Installation Complete**
  - [ ] VoiceMode installed: `claude mcp add --scope user voicemode -- uvx voice-mode`
  - [ ] Installation verified: `claude mcp list`
  - [ ] Connection tested: `claude mcp status voicemode`

- [ ] **Optimal Parameters Set**
  - [ ] VAD mode selected based on environment (1-2 for most cases)
  - [ ] Silence duration tuned (0.7-1.0s typical)
  - [ ] Audio format optimized (PCM for TTS, MP3 for STT)
  - [ ] Sample rate set to 16000 Hz

### Testing & Validation

- [ ] **Basic Functionality**
  - [ ] Test TTS: `voicemode converse` (with simple prompt)
  - [ ] Test STT: Verify speech is correctly transcribed
  - [ ] Test bidirectional: Full conversation flow works

- [ ] **Edge Cases**
  - [ ] Long pauses: Speech not cut off prematurely
  - [ ] Background noise: False positives minimized
  - [ ] Fast/slow speech: Recognition works at different paces
  - [ ] Interruptions: Can interrupt AI mid-response (if supported)

- [ ] **Performance Metrics**
  - [ ] Latency measured: <500ms end-to-end acceptable
  - [ ] Audio quality assessed: Clear and natural
  - [ ] Accuracy tested: Transcription >95% accurate
  - [ ] Stability confirmed: No random disconnections

- [ ] **Monitoring Setup**
  - [ ] Debug logging enabled initially: `VOICEMODE_DEBUG=true`
  - [ ] Audio archival for troubleshooting: `VOICEMODE_SAVE_AUDIO=true`
  - [ ] Log aggregation configured (if production service)
  - [ ] Error alerting set up (API failures, connection issues)

### Platform-Specific Considerations

- [ ] **macOS**
  - [ ] Microphone permissions: System Preferences > Security & Privacy > Microphone
  - [ ] Terminal.app or iTerm2 has microphone access
  - [ ] No additional audio system setup needed

- [ ] **Linux**
  - [ ] PulseAudio/PipeWire running: `ps aux | grep pulse`
  - [ ] User in audio group: `groups | grep audio`
  - [ ] ALSA configured: `aplay -L` shows devices
  - [ ] Test device: `arecord -d 5 test.wav`

- [ ] **Windows (WSL2)**
  - [ ] WSL version 2.3.26.0+ for audio support
  - [ ] Audio packages installed: `libasound2-plugins pulseaudio`
  - [ ] Or LiveKit configured as alternative
  - [ ] USB microphone attached via USB/IP (if applicable)

### Privacy & Security

- [ ] **Local vs. Cloud Decision**
  - [ ] Data sensitivity assessed
  - [ ] Local Whisper + Kokoro deployed (if privacy-critical)
  - [ ] Or OpenAI API with data usage policies understood

- [ ] **Audio Recording Policies**
  - [ ] User consent obtained (if archiving audio)
  - [ ] Storage location secure: `~/.voicemode/audio/`
  - [ ] Retention policy defined
  - [ ] Compliance requirements met (GDPR, HIPAA, etc.)

- [ ] **API Key Management**
  - [ ] Keys stored securely (not in code/logs)
  - [ ] Environment variables or secrets manager used
  - [ ] Key rotation policy defined
  - [ ] Usage monitoring enabled (OpenAI dashboard)

### Performance Optimization

- [ ] **Latency Optimization**
  - [ ] PCM format used for TTS streaming
  - [ ] Local services deployed (if <100ms latency required)
  - [ ] Network path optimized (low-latency routing)
  - [ ] Chunk duration tuned (20-30ms)

- [ ] **Bandwidth Optimization**
  - [ ] Sample rate appropriate (16kHz for speech)
  - [ ] Compression used for uploads (MP3 64k)
  - [ ] Fallback providers configured for redundancy
  - [ ] CDN or edge deployment (if high-scale)

- [ ] **CPU/Memory Optimization**
  - [ ] Buffer sizes tuned: `VOICEMODE_AUDIO_BUFFER_SIZE`
  - [ ] Chunk duration not too small (avoids excessive processing)
  - [ ] Local Whisper model sized appropriately (tiny/base for low-resource, large-v3 for accuracy)
  - [ ] Resource limits set (if containerized)

### Documentation & Runbooks

- [ ] **Configuration Documented**
  - [ ] All environment variables documented
  - [ ] Rationale for parameter choices explained
  - [ ] Alternative configurations provided (high-noise, low-latency, etc.)

- [ ] **Troubleshooting Guides**
  - [ ] Common issues documented with solutions
  - [ ] Diagnostic commands listed
  - [ ] Escalation procedures defined

- [ ] **Maintenance Procedures**
  - [ ] Update process documented: `uvx --refresh voice-mode`
  - [ ] Service restart commands: `voicemode whisper restart`
  - [ ] Health check procedures: `voicemode diag`

---

## Advanced Optimization Techniques

### Multi-Provider Fallback Strategy

Configure multiple STT/TTS providers for resilience:

```bash
# Primary: OpenAI, Fallback: Local
export TTS_BASE_URLS="https://api.openai.com/v1,http://localhost:8001"
export STT_BASE_URLS="https://api.openai.com/v1,http://localhost:8000"
```

**Benefits**:
- Automatic failover if primary service unavailable
- Cost optimization (use free local services, fallback to paid API)
- Latency optimization (try local first, cloud if local fails)

### Hybrid VAD Approach

Combine WebRTC VAD with energy-based detection for best results:

```bash
# Strict VAD mode + energy threshold
export VOICEMODE_VAD_MODE="2"  # Balanced
export VOICEMODE_SILENCE_THRESHOLD="0.015"  # Energy-based cutoff

# Audio considered silence unless BOTH methods detect speech
# Reduces false positives while maintaining sensitivity
```

### Dynamic Parameter Adjustment

Adapt parameters based on real-time conditions:

**High Background Noise Detected**:
- Increase VAD mode from 2 to 3
- Raise silence threshold
- Increase minimum speech duration

**Poor Network Conditions**:
- Switch to lower bitrate: `VOICEMODE_MP3_BITRATE="32k"`
- Reduce sample rate: `VOICEMODE_SAMPLE_RATE="8000"`
- Enable audio caching/buffering

**Low Latency Required**:
- Switch to local services
- Use PCM format exclusively
- Reduce chunk duration to 20ms
- Decrease silence duration to 0.5s

### Semantic Understanding Layer

For future implementations, consider adding semantic analysis:

**Approach**:
1. Transcribe speech continuously
2. Use lightweight NLU model to detect sentence/thought completion
3. Override VAD silence cutoff if semantic analysis indicates incomplete thought

**Benefits**:
- Handles slow speakers with long pauses
- Distinguishes mid-sentence pauses from statement endings
- More natural conversation flow

**Implementation Note**: Not currently available in VoiceMode but can be built as wrapper using streaming transcription + fast NLU model.

---

## Conclusion

Voice mode optimization requires balancing multiple factors:

- **Latency vs. Accuracy**: Faster response often means lower accuracy
- **Sensitivity vs. False Positives**: Lenient VAD captures all speech but also noise
- **Quality vs. Bandwidth**: Higher fidelity requires more network/storage resources
- **Privacy vs. Convenience**: Local services offer privacy at cost of setup complexity

**Recommended Starting Point for Most Users**:
```bash
export OPENAI_API_KEY="your-key"
export VOICEMODE_VAD_MODE="2"
export VOICEMODE_SILENCE_DURATION="0.7"
export VOICEMODE_TTS_AUDIO_FORMAT="pcm"
export VOICEMODE_STT_AUDIO_FORMAT="mp3"
export VOICEMODE_SAMPLE_RATE="16000"
```

Then iterate based on specific use case, environment, and user feedback.

---

## Additional Resources

### Official Documentation
- VoiceMode MCP: https://voice-mode.readthedocs.io
- GitHub Repository: https://github.com/mbailey/voicemode
- Claude Code: https://claude.com/claude-code

### Community Resources
- Claude Code Issues: https://github.com/anthropics/claude-code/issues
- MCP Server Registry: https://mcpservers.org/servers/mbailey/voicemode
- LobeHub Directory: https://lobehub.com/mcp/mbailey-voicemode

### Technical References
- WebRTC VAD: https://github.com/wiseman/py-webrtcvad
- Speech Processing: https://speechprocessingbook.aalto.fi
- Whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Kokoro TTS: https://voice-mode.readthedocs.io/en/latest/kokoro/

### Related Guides
- WSL2 Microphone Setup: https://voice-mode.readthedocs.io/en/latest/troubleshooting/wsl2-microphone-access/
- Getting Started Tutorial: https://voice-mode.readthedocs.io/en/latest/tutorials/getting-started/
- Configuration Reference: https://voice-mode.readthedocs.io/en/latest/api-reference/configuration/

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Maintained By**: Community-sourced research & best practices
**License**: MIT (documentation), see individual projects for code licenses
