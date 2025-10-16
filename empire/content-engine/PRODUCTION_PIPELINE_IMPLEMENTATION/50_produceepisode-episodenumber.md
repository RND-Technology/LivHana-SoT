#### `produceEpisode(episodeNumber)`

Produces a complete episode from script to distribution.

**Parameters:**
- `episodeNumber` (Number): Episode number to produce

**Returns:**
```javascript
{
  episodeNumber: 1,
  title: "Episode Title",
  status: "completed",
  duration: "15.5 minutes",
  finalVideo: "/path/to/video.mp4",
  gcsUrl: "gs://bucket/video.mp4",
  cost: {
    breakdown: {...},
    total: 1.82
  },
  metrics: {...},
  distribution: {
    youtube: {...},
    tiktok: {...},
    instagram: {...}
  }
}
```

---
