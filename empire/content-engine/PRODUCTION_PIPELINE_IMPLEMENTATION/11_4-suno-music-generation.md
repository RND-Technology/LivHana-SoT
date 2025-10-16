### 4. Suno (Music Generation)

**Purpose:** Generate background music

**Implementation:**
```javascript
POST https://api.sunoapi.com/api/v1/generate
Headers:
  - Authorization: Bearer YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "prompt": "Instrumental music description",
    "make_instrumental": true,
    "wait_audio": true
  }
```

**Response:**
```json
{
  "audio_url": "https://cdn.sunoapi.com/..."
}
```

**Cost:** ~$0.10 per track

**Note:** Using third-party API (official API in development)

---
