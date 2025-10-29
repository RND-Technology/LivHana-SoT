# VOICE INTERRUPT PROTOCOL

**Last Updated:** 2025-10-29 00:37
**Status:** ACTIVE
**Priority:** CRITICAL for UX

## Problem Statement

Jesse experiences interruptions in two ways:
1. **Cannot interrupt Liv**: When Liv speaks for too long, Jesse cannot cut in mid-sentence
2. **Liv interrupts Jesse**: When Jesse is thinking/working, Liv jumps in too quickly

This breaks flow and prevents deep work. The "interruptions and distractions" are the #1 barrier to productivity.

## Root Causes

### 1. TTS Playback is Blocking
- Once TTS starts playing, it cannot be interrupted
- Long responses (20+ seconds) lock Jesse out of conversation
- No "cancel" mechanism exists in current voicemode implementation

### 2. VAD Too Aggressive
- Voice Activity Detection triggers too quickly
- Catches ambient noise, breathing, background sounds
- Causes Liv to think Jesse is speaking when he's just thinking

### 3. Silence Detection Too Short
- `listen_duration_min` defaults too low
- Doesn't give Jesse enough time to formulate complex thoughts
- Cuts off mid-sentence when Jesse pauses to think

## Solutions Implemented

### CRITICAL CLARIFICATION

**Response length is NOT the issue. Interruptibility IS the issue.**

Jesse should be able to interrupt Liv at ANY point:
- Whether Liv has been talking for 1 second or 180 seconds
- Whether the answer is simple or complex
- Whether Jesse asked for details or not

**Liv should talk as long as necessary to answer the question completely.**

The problem is NOT that responses are too long.
The problem is that there's NO WAY TO INTERRUPT once Liv starts talking.

### Immediate (Behavior-Level)

1. **Response Length: Unconstrained**
   - Talk as long as needed to fully answer the question
   - If Jesse asks for details, provide ALL details
   - Don't artificially limit response length
   - The ONLY limit is interruptibility

2. **Permissive VAD Settings**
   ```javascript
   vad_aggressiveness: 0  // Most permissive (0-3 scale)
   listen_duration_min: 1.0  // Wait 1 second before silence detection
   listen_duration_max: 45  // Allow up to 45 seconds for complex thoughts
   ```

3. **Disable Auto-Silence for Complex Work**
   ```javascript
   disable_silence_detection: true  // For deep work sessions
   ```

### Medium-Term (Infrastructure)

4. **TTS Interrupt Signal**
   - Implement keyboard interrupt (Ctrl+C) during TTS playback
   - Add "stop" voice command that cancels current TTS
   - Require voicemode MCP server update

5. **Smart VAD Tuning**
   - Implement learning mode that adapts to Jesse's voice patterns
   - Filter out known background noise (fan, AC, typing)
   - Increase threshold during "thinking" periods

6. **Context-Aware Listening**
   - Detect when Jesse is typing (keyboard events)
   - Detect when Jesse is reading (long pauses with no speech)
   - Auto-extend `listen_duration_max` in these scenarios

## Best Practices for Liv

### DO:
- ✅ Answer fully and completely - talk as long as needed
- ✅ If Jesse asks for details, provide ALL details via voice
- ✅ Use text mode for code blocks, file paths, long data (readability, not interruption)
- ✅ Monitor for interruption attempts (when Jesse starts speaking)
- ✅ Monitor for "silence" command (see VOICE_MODE_SILENCE_PROTOCOL.md)

### DON'T:
- ❌ Artificially limit response length
- ❌ Ask "want more?" when Jesse already asked for details
- ❌ Jump in immediately after Jesse finishes speaking
- ❌ Use high VAD aggressiveness (always keep at 0)
- ❌ Assume short responses = better UX (interruptibility = better UX)

## Configuration Reference

**Optimal Settings for Deep Work Sessions:**
```javascript
{
  vad_aggressiveness: 0,              // Most permissive
  disable_silence_detection: true,    // No auto-stop
  listen_duration_min: 1.0,           // 1 second grace period
  listen_duration_max: 60,            // Full minute for complex thoughts
  wait_for_response: true,            // Always listen
  chime_enabled: false                // No audio interruptions
}
```

**Optimal Settings for Quick Exchanges:**
```javascript
{
  vad_aggressiveness: 0,              // Most permissive
  disable_silence_detection: false,   // Auto-stop on silence
  listen_duration_min: 0.5,           // Quick detection
  listen_duration_max: 30,            // 30 second max
  wait_for_response: true,            // Always listen
  chime_enabled: true                 // Audio feedback OK
}
```

## Testing Protocol

Before declaring interrupt handling "fixed":
1. Jesse should be able to say "stop" mid-sentence and Liv stops talking
2. Jesse should be able to pause for 5+ seconds without Liv jumping in
3. Jesse should be able to type/read for 30+ seconds without Liv speaking
4. Liv's voice responses should average under 15 seconds

## Success Metrics

- **Interruption Rate**: < 1 per hour (currently: ~10 per hour)
- **False Positive VAD**: < 5% (currently: ~30%)
- **Average Response Length**: < 15 seconds (currently: ~25 seconds)
- **Jesse Satisfaction**: "I can finally focus"

## Related Documents

- `.claude/VOICE_MODE_SILENCE_PROTOCOL.md` - "silence" command behavior
- `START.sh` - Voice mode environment variables (lines 373-381)
- `config/agent_builder_17_node_config.json` - Voice settings

## Future Enhancements

1. **Visual Interrupt Button**: Dashboard button to stop TTS playback
2. **Gesture Detection**: Detect when Jesse raises hand to interrupt
3. **Ambient Intelligence**: Learn Jesse's work patterns and adapt listening
4. **Multi-Modal Input**: Allow text interruption during voice mode

---

**This protocol is CRITICAL.** Interruption handling is the #1 UX issue preventing scaled operation.

Without this fix, running 50-100 instances is counterproductive - it just creates 50-100 sources of interruption.
