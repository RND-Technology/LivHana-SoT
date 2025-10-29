# VOICE MODE VERIFICATION CHECKLIST
**Created:** 2025-10-27
**Purpose:** Systematic verification of voice mode functionality
**Status:** READY FOR EXECUTION

---

## PHASE 1: SERVICE VERIFICATION

### 1.1 Service Status Check
- [ ] Whisper service running
- [ ] Kokoro service running
- [ ] No error messages in service logs
- [ ] Services responding to status queries

**Test Command:**
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
./tests/voice/test_voice_basic.sh
```

**Expected Result:** Both services show "running" status

---

## PHASE 2: PERMISSIONS VERIFICATION

### 2.1 System Settings Configuration
- [ ] System Settings → Privacy & Security opened
- [ ] Microphone section accessed
- [ ] Terminal application listed
- [ ] Terminal microphone access ENABLED

**Direct Link:**
```
x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone
```

**Manual Path:**
1. Open System Settings (Cmd+Space → "System Settings")
2. Click "Privacy & Security" in left sidebar
3. Scroll down to "Microphone" section
4. Click "Microphone"
5. Find your terminal app (Terminal.app, iTerm, VS Code, etc.)
6. Toggle switch to ON (blue)
7. **IMPORTANT:** Restart terminal application after enabling

### 2.2 Microphone Hardware Check
- [ ] Microphone physically connected (if external)
- [ ] Correct microphone selected in system (Input settings)
- [ ] Microphone volume at reasonable level (50%+)
- [ ] Test microphone in another app (Voice Memos, etc.)

---

## PHASE 3: FUNCTIONALITY TESTING

### 3.1 Text-to-Speech (TTS) Test
- [ ] TTS produces audible speech
- [ ] Speech is clear and understandable
- [ ] No audio glitches or stuttering

**Test Command:**
```bash
./tests/voice/test_voice_basic.sh
```

**Expected Result:** Hear clear speech output

### 3.2 Speech-to-Text (STT) Test
- [ ] System listens for voice input
- [ ] Microphone indicator shows activity
- [ ] Spoken words are transcribed accurately
- [ ] Response completes without timeout

**Test Command:**
```bash
./tests/voice/test_voice_permissions.sh
```

**Expected Result:** Your speech is transcribed and displayed

### 3.3 Full Conversation Test
- [ ] Can initiate voice conversation
- [ ] Can respond to voice prompts
- [ ] Multiple exchanges work smoothly
- [ ] Natural conversation flow maintained

**Test Command:**
```bash
./tests/voice/test_voice_interactive.sh
```

**Expected Result:** Natural back-and-forth conversation

---

## PHASE 4: INTEGRATION VERIFICATION

### 4.1 Claude Integration
- [ ] Can invoke voice mode from Claude
- [ ] Voice responses integrate with text conversation
- [ ] Context maintained across voice/text transitions

### 4.2 Workflow Integration
- [ ] Voice commands execute correctly
- [ ] Can dictate code or documentation
- [ ] Voice mode enhances productivity

---

## SUCCESS CRITERIA

**MINIMUM VIABLE:**
- ✓ Both services running
- ✓ TTS produces audio
- ✓ STT captures speech
- ✓ Single voice exchange completes

**PRODUCTION READY:**
- ✓ All minimum criteria met
- ✓ Multi-turn conversations work
- ✓ No permission errors
- ✓ Stable performance over 5+ exchanges

**OPTIMAL:**
- ✓ All production criteria met
- ✓ Natural conversation flow
- ✓ Fast response times (<2s)
- ✓ High transcription accuracy (>95%)

---

## TROUBLESHOOTING GUIDE

### Issue: Services won't start
**Solution:**
```bash
# Check system resources
top -l 1 | grep -E "CPU|PhysMem"

# Check service logs
mcp__voicemode__service whisper logs
mcp__voicemode__service kokoro logs

# Force restart
mcp__voicemode__service whisper stop
sleep 2
mcp__voicemode__service whisper start
```

### Issue: TTS works but STT doesn't
**Root Cause:** Microphone permissions not granted
**Solution:** Follow PHASE 2.1 exactly, then restart terminal

### Issue: Microphone permission granted but still not working
**Solutions:**
1. Check System Settings → Sound → Input (select correct mic)
2. Test mic in Voice Memos app
3. Restart Whisper service: `mcp__voicemode__service whisper restart`
4. Check Whisper logs for errors

### Issue: Audio stuttering or poor quality
**Solutions:**
1. Close other audio applications
2. Check CPU usage (should be <80%)
3. Reduce `listen_duration_max` parameter
4. Adjust `speed` parameter (0.9-1.1 range)

### Issue: Transcription inaccurate
**Solutions:**
1. Speak more clearly and slowly
2. Reduce background noise
3. Move closer to microphone
4. Increase `listen_duration_min` to allow longer pauses
5. Adjust `vad_aggressiveness` (try 1 for more permissive)

---

## NEXT STEPS AFTER VERIFICATION

1. **Document Working Configuration**
   - Record exact settings that work
   - Note microphone model/type
   - Save working parameters

2. **Establish Baseline**
   - Run tests 3 times to confirm stability
   - Measure average response times
   - Document any quirks or limitations

3. **Integrate into Workflow**
   - Create voice command shortcuts
   - Set up common voice workflows
   - Train on optimal usage patterns

4. **Monitor Over Time**
   - Weekly functionality check
   - Track any degradation
   - Update as services evolve

---

## EXECUTION TIMESTAMP

**Services Restarted:** 2025-10-27
**Tests Created:** 2025-10-27
**Checklist Prepared:** 2025-10-27
**Ready for Jesse:** YES

**IMMEDIATE ACTION REQUIRED:** Grant microphone permissions (see PHASE 2.1)
