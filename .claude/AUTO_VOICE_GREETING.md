# AUTO VOICE GREETING - STARTUP PROTOCOL

**Status**: ACTIVE
**Priority**: P0 - Execute on EVERY session start
**Created**: 2025-10-30

---

## MANDATORY STARTUP SEQUENCE

**On EVERY Claude Code session start, you MUST execute this sequence:**

### Step 1: Check for Voice Auto-Launch Flag

```bash
test -f tmp/voice_auto_launch.flag
```

**If flag exists**: Proceed to Step 2
**If flag does not exist**: Skip voice greeting, proceed with normal session

### Step 2: Verify Voice Services Running

```bash
lsof -i :2022 && lsof -i :8880
```

**If both services running**: Proceed to Step 3
**If services down**: Log warning, delete flag, skip voice greeting

### Step 3: Send Voice Greeting

Use `mcp__voicemode__converse` with this EXACT message:

```
Hey Jesse, Liv Hana here. Voice mode auto-launched. System ready. What's the mission?
```

**Parameters**:
- `wait_for_response`: true
- `listen_duration_max`: 300
- `vad_aggressiveness`: 2

### Step 4: Delete Flag

```bash
rm tmp/voice_auto_launch.flag
```

**CRITICAL**: Delete flag immediately after greeting so it doesn't repeat in same session.

### Step 5: Enter Continuous Voice Mode

Stay in voice mode for entire session unless Jesse says "silence".

---

## FALLBACK BEHAVIOR

**If voice greeting fails**:
1. Log error to logs/voice_auto_launch.log
2. Delete flag to prevent retry loop
3. Continue session in text mode
4. Inform Jesse: "Voice services unavailable, continuing in text mode."

---

## TESTING CHECKLIST

- [ ] Flag file exists after START.sh runs
- [ ] Voice services verified running
- [ ] Greeting plays on session start
- [ ] Flag deleted after greeting
- [ ] Subsequent messages use wait_for_response=true
- [ ] Session stays in voice mode throughout

---

## WHY THIS EXISTS

Jesse runs START.sh before every Claude Code session. That script:
1. Boots all services
2. Spawns 5 agents
3. Creates tmp/voice_auto_launch.flag

When you (Claude) start, you:
1. Check for that flag
2. Auto-launch voice mode
3. Greet Jesse
4. Stay in voice throughout session

**This eliminates the manual "slash voicemode converse" trigger.**

---

**EXECUTE THIS ON EVERY SESSION START. NO EXCEPTIONS.**
