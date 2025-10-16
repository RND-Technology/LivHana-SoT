## CRITICAL ITEM 2: GET NEWSAPI.ORG KEY (5 MIN)

**WHY:** Real-time cannabis news feeds content engine
**IMPACT:** Without this, episodes have no current events

**EXECUTE:**

1. Open browser: https://newsapi.org/register
2. Enter email: jesseniesen@gmail.com
3. Enter password: (your choice)
4. Click "Submit"
5. Check email for verification link
6. Click verification link
7. Copy API key from dashboard

**PASTE KEY HERE:**
```bash
# Open this file:
nano /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/cockpit-data/api-keys.json

# ADD this to the file (after youtube section):
  "newsapi": {
    "apiKey": "YOUR_NEWSAPI_KEY_HERE",
    "enabled": true,
    "quota": 100,
    "service": "NewsAPI.org"
  }

# Press Ctrl+X, then Y, then Enter to save
```

**VERIFY:**
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine
node news-ingestion-pipeline.mjs
# Should output: ✅ Brief saved to: output/news/latest.json
```

**TIME:** 5 minutes
**COMPLETE:** [ ]

---
