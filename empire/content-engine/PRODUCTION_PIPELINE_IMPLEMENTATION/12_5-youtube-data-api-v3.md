### 5. YouTube Data API v3

**Purpose:** Upload videos to YouTube

**Implementation:**

**Step 1: Get Access Token**
```javascript
POST https://oauth2.googleapis.com/token
Body:
  - client_id: YOUR_CLIENT_ID
  - client_secret: YOUR_CLIENT_SECRET
  - refresh_token: YOUR_REFRESH_TOKEN
  - grant_type: refresh_token
```

**Step 2: Upload Video**
```javascript
POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status
Headers:
  - Authorization: Bearer {access_token}
  - Content-Type: multipart/related; boundary="..."
Body: (multipart)
  - Part 1: Video metadata (JSON)
  - Part 2: Video file (binary)
```

**Cost:** Free (with quotas)

**Important:** Unverified projects upload to private by default

---
