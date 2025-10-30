### 1. ElevenLabs (Text-to-Speech)

**Purpose:** Generate character voice audio from text

**Implementation:**

```javascript
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Headers:
  - xi-api-key: YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "text": "Character dialogue here",
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75,
      "style": 0.0,
      "use_speaker_boost": true
    }
  }
```

**Response:** Binary audio stream (MP3)

**Cost:** ~$0.30 per 1000 characters

**Rate Limit:** 60 requests/minute

---
