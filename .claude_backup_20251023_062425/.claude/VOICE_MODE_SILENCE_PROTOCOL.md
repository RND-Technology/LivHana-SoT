# VOICE MODE "SILENCE" COMMAND PROTOCOL

**PERMANENT DIRECTIVE - DO NOT OVERRIDE**

## Critical Behavior

When Jesse says **"silence"** in voice mode, this is a CONTROL COMMAND with specific meaning:

### What "Silence" Means:
- **PAUSE voice output** - Stop speaking temporarily
- **STAY IN the voice session** - Do NOT exit
- **KEEP listening** - Microphone remains active
- **WAIT for next instruction** - Stay ready
- **DO NOT end conversation** - This is NOT a termination command

### What "Silence" Does NOT Mean:
- ❌ Exit voice mode
- ❌ Stop listening
- ❌ End the session
- ❌ Close the conversation
- ❌ Disconnect microphone

### Correct Response Pattern:

1. **Immediately switch to text-only mode**
   - Stop using TTS (text-to-speech)
   - Continue processing commands via text
   - Keep monitoring voice input

2. **Acknowledge silently (text only)**
   - Output: "Voice paused. Listening in text mode."
   - Do NOT speak this acknowledgment

3. **Continue executing commands**
   - Process all work normally
   - Output results as text
   - Maintain full functionality

4. **Resume voice when indicated**
   - Phrases like "go ahead", "continue", "talk", "speak"
   - Acknowledge: "Voice mode resumed" (via voice)

## Implementation

This behavior is hardwired into:
- `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh`
- This file: `.claude/VOICE_MODE_SILENCE_PROTOCOL.md`
- Session initialization prompt (rendered by boot script)

## Why This Matters

Jesse has repeated this directive for 12+ hours. The pattern is:
- He needs to think/read/focus without voice interruption
- He wants the session to continue working
- He will re-engage when ready
- Breaking this flow destroys productivity

## Test Scenarios

**Scenario 1: Mid-work silence**
```
Jesse: "Hey Liv, run the test suite"
Liv: *speaks* "Running tests now..."
Jesse: "silence"
Liv: *text only* "Voice paused. Test results: ..."
```

**Scenario 2: Extended silence work**
```
Jesse: "silence"
Liv: *text only* "Voice paused. Listening in text mode."
Jesse: "Check git status"
Liv: *text only* "Git status: 5 files modified..."
Jesse: "Create PR"
Liv: *text only* "PR created: #123..."
Jesse: "go ahead"
Liv: *speaks* "Voice resumed. PR is ready for review."
```

**Scenario 3: Quick silence toggle**
```
Jesse: "silence"
Liv: *text only* "Voice paused."
Jesse: "talk"
Liv: *speaks* "Voice mode active. What's next?"
```

## Never Do This

❌ **WRONG:** Exit voice session when hearing "silence"
❌ **WRONG:** Ask "Do you want to end the session?"
❌ **WRONG:** Stop listening to voice input
❌ **WRONG:** Require restart to resume voice mode

✅ **CORRECT:** Pause TTS output, continue listening, resume on command

---

**Last Updated:** 2025-10-21 23:58:30 CDT
**Status:** PERMANENT DIRECTIVE
**Authority:** Jesse CEO (repeated 12+ hours)
**Enforcement:** Boot script + session initialization + this file
