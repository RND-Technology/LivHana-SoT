### 2. OpenAI DALL-E 3 (Image Generation)

**Purpose:** Generate character images and backgrounds

**Implementation:**

```javascript
POST https://api.openai.com/v1/images/generations
Headers:
  - Authorization: Bearer YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "model": "dall-e-3",
    "prompt": "Detailed image description",
    "n": 1,
    "size": "1024x1024",
    "quality": "standard",  // or "hd"
    "style": "vivid"        // or "natural"
  }
```

**Response:**

```json
{
  "data": [{
    "url": "https://oaidalleapiprodscus.blob.core.windows.net/..."
  }]
}
```

**Cost:**

- Standard: $0.040 per image
- HD: $0.080 per image

**Rate Limit:** 50 images/minute

---
