## CRITICAL ITEM 1: GET YOUTUBE DATA API KEY (10 MIN)

**WHY:** YouTube analyzer needs this to extract viral patterns
**IMPACT:** Without this, content engine runs blind

**EXECUTE:**

1. Open browser: <https://console.cloud.google.com/>
2. Click "Select a project" → "New Project"
3. Name: `LivHana Content Engine`
4. Click "CREATE"
5. Wait 30 seconds for project creation
6. Go to: <https://console.cloud.google.com/apis/library/youtube.googleapis.com>
7. Click "ENABLE"
8. Wait 30 seconds
9. Go to: <https://console.cloud.google.com/apis/credentials>
10. Click "+ CREATE CREDENTIALS" → "API key"
11. Copy the key (starts with `AIza...`)
12. Click "RESTRICT KEY"
13. Under "API restrictions" → Select "YouTube Data API v3"
14. Click "SAVE"

**PASTE KEY HERE:**

```bash
# Open this file in terminal:
nano /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/cockpit-data/api-keys.json

# Paste this EXACTLY (replace YOUR_KEY):
{
  "youtube": {
    "apiKey": "YOUR_YOUTUBE_API_KEY_HERE",
    "enabled": true,
    "quota": 10000,
    "service": "YouTube Data API v3"
  }
}

# Press Ctrl+X, then Y, then Enter to save
```

**VERIFY:**

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine
node youtube-analyzer.mjs
# Should output: ✅ Insights saved to: cockpit-data/youtube-insights.json
```

**TIME:** 10 minutes
**COMPLETE:** [ ]

---
