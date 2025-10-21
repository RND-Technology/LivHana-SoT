### **2025-10-06 21:10 PDT - FIRST BUG FOUND AND FIXED ✅**

**Bug**: tts.js tried to iterate `parsedScript.dialogue` (doesn't exist)
**Root Cause**: Dialogue is nested inside `parsedScript.scenes`, not a top-level array
**Fix Applied**: Changed line 113 from:
```javascript
for (const dialogue of parsedScript.dialogue) {
```
To:
```javascript
for (const scene of parsedScript.scenes) {
  for (const dialogue of scene.dialogue) {
```
**Status**: Bug fixed, ready to restart HNC API

**What I Learned**:
- ✅ HNC system was already modified to use ElevenLabs (not OpenAI)
- ✅ ELEVENLABS_API_KEY retrieval works via: `op item get "ELEVENLABS_API_KEY" --fields label=credential`
- ✅ Parser creates nested structure (scenes contain dialogue arrays)
- ✅ TTS generateEpisodeAudio needs to iterate scenes first, then dialogue

**Next**: Restart HNC API with fixed code
