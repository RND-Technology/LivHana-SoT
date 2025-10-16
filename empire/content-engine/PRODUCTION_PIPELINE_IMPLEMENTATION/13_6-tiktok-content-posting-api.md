### 6. TikTok Content Posting API

**Purpose:** Post videos to TikTok

**Implementation:**

**Step 1: Initialize Upload**
```javascript
POST https://open.tiktokapis.com/v2/post/publish/video/init/
Headers:
  - Authorization: Bearer YOUR_ACCESS_TOKEN
Body:
  {
    "post_info": {
      "title": "Video title",
      "privacy_level": "PUBLIC_TO_EVERYONE"
    },
    "source_info": {
      "source": "FILE_UPLOAD",
      "video_size": 12345678
    }
  }
```

**Step 2: Upload Video**
```javascript
PUT {upload_url_from_init}
Body: Video file (binary)
```

**Cost:** Free (with quotas)

**Important:** Unaudited clients upload to private by default

---
