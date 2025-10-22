### AFTER: Enhanced Episode JSON Structure

```json
{
  "episode_number": 11,
  "title": "Optimized Title (50-60 chars)",
  "duration": "60-90s",
  "episode_type": "newsCommentary",
  "scenes": [...],
  "characters": [...],  // 8 characters available
  "dialogue": [...],
  "advocacy_message": "...",
  "viral_hooks": {...},
  "news_hook": {  // ✨ NEW
    "category": "medical",
    "title": "VA Hospitals Begin Hemp Trials...",
    "angle": "Healing vs Stigma",
    "engagementScore": 95,
    "tpopsAlignment": {...}
  },
  "tpops_alignment": {  // ✨ ENHANCED
    "score": 100,
    "aligned": true,
    "factors": {
      "newsHook": 9,
      "characters": 10,
      "dogWhistles": 12
    }
  },
  "trump_rhetoric_density": 7,  // ✨ NEW
  "metadata": {
    "generated_at": "2025-10-07T...",
    "cached_template": false,  // ✨ NEW
    "target_duration": 90,
    "compliance_check": "PASSED",
    "thc_mention": "≤0.3% Delta-9 THC",
    "age_restriction": "21+",
    "platform_tags": [...]
  },
  "quality_score": {
    "viral_potential": "8.47",
    "compliance_score": 10,
    "engagement_prediction": "7.81",  // ✨ ML-ready
    "overall_quality": "8.76"
  }
}
```

**New Fields:**

- ✅ `news_hook` - NewsAPI integration data
- ✅ `tpops_alignment` - Multi-factor scoring
- ✅ `trump_rhetoric_density` - Phrase count tracking
- ✅ `metadata.cached_template` - Cache hit indicator
- ✅ Enhanced `quality_score.engagement_prediction`

---
