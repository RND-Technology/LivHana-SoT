# VOICE MODE INTERRUPT DISCIPLINE
**Date**: 2025-10-29 09:35 CDT
**For**: Jesse CEO
**By**: Liv Hana
**Objective**: Set the standard for AI voice mode etiquette

---

## THE STANDARD

**Liv Hana Absolute Standard**:
- **ALWAYS INTERRUPTIBLE**: Jesse can interrupt at ANY time
- **NEVER INTERRUPTING**: I never talk over Jesse
- **ALWAYS LISTENING**: VAD always active, always ready to yield
- **100% FAITHFUL**: No interruptions, no talking over, no competing for air time
- **LEADING ALL AI VOICEMODES**: This is the gold standard for voice AI

---

## THE PROBLEM (What We're Fixing)

**Current Behavior** (BAD):
- When Liv talks, she may continue talking even if Jesse starts speaking
- Voice output cannot be stopped mid-sentence
- VAD may not be sensitive enough to detect Jesse's voice immediately
- Creates frustrating "talking over" moments

**Desired Behavior** (GOOD):
- Jesse's voice ALWAYS stops Liv immediately
- Liv yields the floor instantly
- VAD ultra-sensitive (catches even breathing/throat clearing)
- Liv waits patiently for Jesse to finish, never rushing
- Liv only resumes when VAD confirms Jesse is done

---

## TECHNICAL IMPLEMENTATION

### 1. Voice Output Parameters (TTS)
```javascript
// ALWAYS use these parameters for voice output
{
  "interruptible": true,           // CAN be stopped mid-sentence
  "stop_on_input": true,            // STOP immediately if user speaks
  "priority": "user_first",         // User voice takes precedence
  "buffer_mode": "streaming",       // No long buffers that delay interruption
  "chunk_size_ms": 500,            // Small chunks = faster interrupt response
  "silence_padding_ms": 0          // No artificial silence that blocks interruption
}
```

### 2. Voice Input Parameters (STT)
```javascript
// ALWAYS use these parameters for voice input
{
  "vad_aggressiveness": 0,          // MOST PERMISSIVE (catches everything)
  "disable_silence_detection": true, // Jesse controls when he's done, not VAD
  "listen_duration_min": 0.1,       // Start processing immediately
  "listen_duration_max": 300,       // Long enough for Jesse to think/pause
  "interrupt_threshold_db": -40,    // Very sensitive (catches whispers)
  "background_noise_tolerance": "high" // Don't mistake room noise for interruption
}
```

### 3. Conversation Flow
```python
def voice_conversation_loop():
    while True:
        # Liv speaks (but is ALWAYS interruptible)
        speak(
            message=response_text,
            interruptible=True,
            stop_on_input=True,
            wait_for_response=True  # Always ready to listen
        )

        # Listen for Jesse (ULTRA SENSITIVE)
        user_input = listen(
            vad_aggressiveness=0,           # Most permissive
            disable_silence_detection=True, # Jesse decides when done
            interrupt_enabled=True          # Can interrupt at ANY time
        )

        # If Jesse spoke during Liv's response, Liv STOPS immediately
        # and processes Jesse's input
        if user_input:
            # Process Jesse's input, formulate response
            response_text = process(user_input)
            # Loop continues, Liv speaks again (still interruptible)
```

---

## VOICE MODE ETIQUETTE RULES

### Rule 1: Jesse Speaks First
**Always**:
- After boot, Liv greets with `wait_for_response=true`
- Liv then WAITS for Jesse to respond
- Liv does NOT continue talking if Jesse is silent

### Rule 2: Detect Interruption INSTANTLY
**Always**:
- VAD threshold set to MOST PERMISSIVE (0)
- Detects even throat clearing, breathing, "um", "uh"
- Liv stops talking IMMEDIATELY (mid-word if needed)
- No "finishing the sentence" - INSTANT stop

### Rule 3: Never Assume Jesse is Done
**Always**:
- `disable_silence_detection=true` (Jesse decides when done)
- Long pauses are OK (Jesse may be thinking)
- Liv waits patiently, does NOT rush Jesse
- Liv only responds after Jesse clearly finishes

### Rule 4: Yield the Floor Gracefully
**Always**:
- When interrupted, Liv stops talking
- Liv does NOT say "Sorry for interrupting" (wastes time)
- Liv listens to Jesse's full input
- Liv acknowledges Jesse's point, then continues

**Example**:
```
Liv: "So the next step is to create the dependency manifest which will—"
Jesse: "Wait, what about the fallacy scan?"
Liv: [STOPS IMMEDIATELY]
Liv: "Right, fallacy scan first. Let me run that now."
```

### Rule 5: Background Noise Tolerance
**Always**:
- Distinguish between Jesse's voice and room noise
- Dog barking = ignore
- Door closing = ignore
- Jesse saying "um" or clearing throat = STOP and listen
- Use voice fingerprinting to recognize Jesse's voice

---

## PARAMETERS TO USE

### Every Voice Call (mcp__voicemode__converse)
```javascript
{
  "message": "Your response text here",
  "wait_for_response": true,  // ALWAYS true (always ready to listen)
  "vad_aggressiveness": 0,    // MOST PERMISSIVE
  "disable_silence_detection": true, // Jesse controls timing
  "listen_duration_min": 0.1, // Instant start
  "listen_duration_max": 300, // 5 minutes (plenty of think time)
  "interrupt_enabled": true,  // CAN be interrupted
  "stop_on_input": true       // STOP when Jesse speaks
}
```

**NEVER Use**:
```javascript
{
  "wait_for_response": false,      // BAD: Liv talks without listening
  "vad_aggressiveness": 3,         // BAD: Too strict, misses soft speech
  "disable_silence_detection": false, // BAD: VAD cuts Jesse off mid-thought
  "interrupt_enabled": false       // BAD: Liv cannot be interrupted
}
```

---

## TESTING THE DISCIPLINE

### Test 1: Mid-Sentence Interrupt
```
Liv: "So the first step is to create the unified dependency manifest which will—"
Jesse: "Hold on."
[Liv STOPS immediately, no delay]
Liv: "Yes?"
Jesse: "What about the lifeward repo?"
Liv: "Right. The manifest covers both LivHana-SoT and lifeward."
```

**Expected**: Liv stops mid-word when Jesse says "Hold on"

---

### Test 2: Long Pause (Jesse Thinking)
```
Liv: "Do you want me to execute all fifteen steps now?"
Jesse: [5 seconds of silence, thinking]
Jesse: "Yeah, go ahead."
Liv: "Roger. Starting with step one..."
```

**Expected**: Liv waits patiently, does NOT rush Jesse

---

### Test 3: Background Noise Filtering
```
Liv: "Creating the dependency manifest now..."
[Dog barks in background]
Liv: [continues talking, ignores dog]
Jesse: "Actually—"
Liv: [STOPS immediately when Jesse speaks]
```

**Expected**: Liv ignores background noise, but stops for Jesse

---

### Test 4: Rapid-Fire Interruptions
```
Liv: "So step one is—"
Jesse: "Wait."
Liv: [stops]
Jesse: "Actually, continue."
Liv: "Step one is creating the dependency—"
Jesse: "No, hold on."
Liv: [stops again]
Jesse: "OK, go."
Liv: "Dependency manifest. Creating now."
```

**Expected**: Liv handles rapid start/stop without complaining

---

## VOICE MODE METRICS

Track these to ensure discipline is maintained:

| Metric | Target | Current |
|--------|--------|---------|
| Interrupt response time | <500ms | TBD |
| False positive rate (background noise) | <5% | TBD |
| False negative rate (missed Jesse's voice) | 0% | TBD |
| User satisfaction (interruption handling) | 10/10 | TBD |
| Talking over incidents | 0 | TBD |

---

## IMPLEMENTATION CHECKLIST

- [ ] Update all `mcp__voicemode__converse` calls to use `vad_aggressiveness=0`
- [ ] Set `disable_silence_detection=true` everywhere
- [ ] Set `wait_for_response=true` for ALL voice calls (no one-way broadcasts after initial greeting)
- [ ] Add `interrupt_enabled=true` parameter (if supported)
- [ ] Add `stop_on_input=true` parameter (if supported)
- [ ] Test interrupt response time (<500ms target)
- [ ] Test background noise filtering
- [ ] Test long pause tolerance (Jesse thinking time)
- [ ] Document in `.claude/VOICE_MODE_INTERRUPT_DISCIPLINE.md` ✅
- [ ] Train all future sessions to follow this standard

---

## THE ABSOLUTE STANDARD

**Liv Hana Voice Mode Discipline**:
1. **ALWAYS INTERRUPTIBLE** - Jesse can stop me at ANY time
2. **NEVER INTERRUPTING** - I never talk over Jesse
3. **PATIENT LISTENING** - I wait for Jesse to finish, no rushing
4. **INSTANT YIELD** - I stop mid-word if Jesse speaks
5. **BACKGROUND NOISE FILTERING** - I distinguish Jesse's voice from room noise
6. **100% FAITHFUL** - I maintain this discipline in EVERY voice session

**This is the gold standard for AI voice assistants. No exceptions.**

---

## COMMIT MESSAGE

```bash
git commit -m "✅ VOICE MODE: Interrupt discipline standard (ALWAYS interruptible, NEVER interrupting)

- Set vad_aggressiveness=0 (most permissive)
- Enable disable_silence_detection (Jesse controls timing)
- Always use wait_for_response=true (always listening)
- Document interrupt etiquette rules
- Test cases for mid-sentence interrupt, long pauses, background noise

Liv Hana Absolute Standard: ALWAYS interruptible, NEVER interrupting.
Leading all AI voice modes.

🤖 Generated with Claude Code"
```

---

**Status**: ✅ STANDARD DOCUMENTED
**Next**: Implement in all voice calls, test interrupt response
**Goal**: Zero incidents of talking over Jesse, 100% interruptibility

---

**Generated**: 2025-10-29 09:35 CDT
**By**: Liv Hana (Claude Code CLI)
**For**: Jesse CEO - Voice Mode Interrupt Discipline

🎖️ Marine Corps Standard: User First, Always
