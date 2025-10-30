# CANNABIS NEWS PIPELINE - QUICK START

## INSTANT USE

### View Today's News

```bash
cat empire/content-engine/output/news/latest.json | python3 -m json.tool
```

### Run Pipeline Manually

```bash
cd empire/content-engine
node news-ingestion-pipeline.mjs
```

### Set Up Daily Automation

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 9 AM):
0 9 * * * /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/run-daily-news.sh >> /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/output/news/logs/cron.log 2>&1
```

---

## TODAY'S EPISODE IDEAS (OCT 7, 2025)

### 1. The Vape Ban Paradox (10/10)

**Story**: Texas bans cannabinoid vapes with 1 year jail time
**Dialogue**: "I can buy Delta-8 gummies, but vape it and that's a year in jail?"
**Platforms**: YouTube Shorts, TikTok, Instagram Reels

### 2. Trump's Cannabis Countdown (10/10)

**Story**: Trump promises decision "in coming weeks" on rescheduling
**Dialogue**: "We been hearing 'coming weeks' for coming YEARS."
**Platforms**: YouTube Shorts, TikTok, Twitter/X

### 3. Austin's Decrim Dream Dies (10/10)

**Story**: Court blocks Austin marijuana decriminalization
**Dialogue**: "Ken Paxton sued FIVE cities just to keep arresting people for weed."
**Platforms**: YouTube Shorts, Instagram Reels, Twitter/X

---

## FILE LOCATIONS

```
empire/content-engine/
├── news-ingestion-pipeline.mjs        # Main script
├── run-daily-news.sh                   # Automation script
├── NEWS-PIPELINE-README.md             # Full documentation
├── NEWS-PIPELINE-STATUS.md             # Status report
└── output/news/
    ├── latest.json                     # Always current brief
    ├── daily-cannabis-brief-YYYY-MM-DD.json
    └── logs/                           # Execution logs
```

---

## KEY COMMANDS

```bash
# View latest brief
cat output/news/latest.json

# Run pipeline
node news-ingestion-pipeline.mjs

# Test automation script
./run-daily-news.sh

# Check if cron is running
crontab -l

# View logs
ls -ltr output/news/logs/

# View latest log
tail -50 output/news/logs/pipeline-*.log | tail -50
```

---

## INTEGRATION

### Pull Latest News in Your Script

```javascript
import latestNews from './output/news/latest.json' assert { type: 'json' };

const topStory = latestNews.top_3_episode_ideas[0];
console.log(topStory.episode_concept);
console.log(topStory.dialogue_hooks);
```

### Use in Episode Generator

```javascript
// Get today's top cannabis stories
const brief = latestNews;
const episodes = brief.top_3_episode_ideas;

episodes.forEach(episode => {
  console.log(`Creating episode: ${episode.episode_concept}`);
  console.log(`Viral potential: ${episode.viral_potential}/10`);
  console.log(`Dialogue: ${episode.dialogue_hooks.join('\n')}`);
});
```

---

## OUTPUT FORMAT

```json
{
  "date": "2025-10-07",
  "texas_news": [...],
  "federal_news": [...],
  "culture_trends": [...],
  "top_3_episode_ideas": [
    {
      "rank": 1,
      "episode_concept": "Title",
      "key_story": "Main story",
      "viral_potential": 10,
      "advocacy_angle": "Reform angle",
      "dialogue_hooks": ["Line 1", "Line 2", "Line 3"],
      "platforms": ["YouTube", "TikTok"],
      "target_length": "3-5 minutes"
    }
  ],
  "summary": {
    "total_items": 7,
    "high_viral_potential": 4,
    "top_advocacy_priority": "Criminal justice reform"
  }
}
```

---

## TROUBLESHOOTING

**Pipeline not running?**

```bash
# Check Node.js
node --version

# Run manually to see errors
node news-ingestion-pipeline.mjs
```

**Cron not working?**

```bash
# Check crontab
crontab -l

# Check cron service (macOS)
sudo launchctl list | grep cron

# Check logs
tail -f output/news/logs/cron.log
```

**Empty data?**

- Pipeline needs API integration for automatic data collection
- Currently uses manually gathered news from WebSearch
- See NEWS-PIPELINE-README.md for API integration instructions

---

## NEXT STEPS

1. Review `output/news/latest.json` daily
2. Use top episode ideas for content creation
3. Share dialogue hooks with writers
4. Set up cron for daily automation
5. Integrate with existing content pipeline

---

**Full docs**: NEWS-PIPELINE-README.md
**Status**: NEWS-PIPELINE-STATUS.md
**Version**: 1.0.0
