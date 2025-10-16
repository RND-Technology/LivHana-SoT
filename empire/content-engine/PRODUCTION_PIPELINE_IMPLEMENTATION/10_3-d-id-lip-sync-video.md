### 3. D-ID (Lip-Sync Video)

**Purpose:** Create talking head videos from images and audio

**Implementation:**

**Step 1: Create Talk**
```javascript
POST https://api.d-id.com/talks
Headers:
  - Authorization: Basic YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "source_url": "data:image/png;base64,{base64_image}",
    "script": {
      "type": "audio",
      "audio_url": "data:audio/mpeg;base64,{base64_audio}"
    },
    "config": {
      "fluent": true,
      "pad_audio": 0,
      "stitch": true
    }
  }
```

**Response:**
```json
{
  "id": "talk-12345",
  "status": "created"
}
```

**Step 2: Poll Status**
```javascript
GET https://api.d-id.com/talks/{talk_id}
```

**Response (when done):**
```json
{
  "id": "talk-12345",
  "status": "done",
  "result_url": "https://d-id-talks-prod.s3.us-west-2.amazonaws.com/..."
}
```

**Cost:** ~$0.05 per second of video

**Processing Time:** 4x faster than real-time (100 FPS)

---
