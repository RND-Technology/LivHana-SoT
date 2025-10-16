### Step 2.5: Update VoiceMode.jsx

**File:** `src/components/VoiceMode.jsx`

**Replace lines 158-173 (speakWithElevenLabs function) with:**

```javascript
import api from '../api/livhanaApiClient';

const speakWithElevenLabs = async (text) => {
  try {
    setIsSpeaking(true);
    setAgentStatus('speaking');
    setHealthStatus((prev) => ({ ...prev, voice: 'healthy' }));

    const audioBlob = await api.voice.synthesize({
      text: text,
      voiceId: selectedVoice,
      voiceSettings: {
        stability: stability / 100,
        similarity_boost: similarityBoost / 100
      }
    });

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      setAgentStatus('ready');
      setHealthStatus((prev) => ({ ...prev, voice: 'healthy' }));
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      console.error('Audio playback error');
      setIsSpeaking(false);
      setAgentStatus('error');
      setHealthStatus((prev) => ({ ...prev, voice: 'down' }));
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();

  } catch (error) {
    console.error('Voice TTS error:', error);
    setIsSpeaking(false);
    setAgentStatus('error');
    setHealthStatus((prev) => ({ ...prev, voice: 'down' }));

    if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
      alert(`Authentication Error: ${error.message}\n\nPlease log in to use voice features.`);
    } else {
      alert(`Voice synthesis failed: ${error.message}`);
    }
  }
};
```
