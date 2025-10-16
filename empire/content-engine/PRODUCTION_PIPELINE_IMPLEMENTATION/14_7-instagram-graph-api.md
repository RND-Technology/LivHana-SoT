### 7. Instagram Graph API

**Purpose:** Post reels to Instagram

**Implementation:**

**Step 1: Create Container**
```javascript
POST https://graph.facebook.com/v19.0/{ig_user_id}/media
Body:
  - media_type: REELS
  - video_url: {public_video_url}
  - caption: "Video caption"
  - access_token: YOUR_ACCESS_TOKEN
```

**Step 2: Publish**
```javascript
POST https://graph.facebook.com/v19.0/{ig_user_id}/media_publish
Body:
  - creation_id: {container_id}
  - access_token: YOUR_ACCESS_TOKEN
```

**Cost:** Free

**Requirements:**
- Video must be publicly accessible
- Business/Creator account required
- Up to 90 seconds for most accounts

---
