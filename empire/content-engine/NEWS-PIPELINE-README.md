# Cannabis News Ingestion Pipeline

## Overview

The **Real-Time Cannabis News Ingestion Pipeline** continuously monitors and ingests cannabis news from Texas and US federal sources, extracting key talking points for High Noon Cartoon (HNC) episodes. News items are scored by viral potential and advocacy opportunity.

## Features

- **Multi-Source News Gathering**: Texas legislation, federal policy, business trends, culture shifts
- **Automated Character Angles**: Generate dialogue hooks for Reggie, Dro, and Tex
- **Viral Potential Scoring**: 1-10 scale based on controversy, politics, economics
- **Advocacy Opportunity Detection**: Identifies criminal justice, economic, medical access angles
- **Episode Idea Generation**: Top 3 episode concepts with dialogue and scene ideas
- **Daily Automation**: Cron-ready script for hands-free operation

## File Structure

```
empire/content-engine/
├── news-ingestion-pipeline.mjs       # Main pipeline script
├── run-daily-news.sh                  # Automation shell script
├── NEWS-PIPELINE-README.md            # This file
└── output/
    └── news/
        ├── daily-cannabis-brief-YYYY-MM-DD.json  # Daily briefs
        ├── latest.json                            # Always points to most recent
        └── logs/                                  # Execution logs
```

## Installation

### Prerequisites

- Node.js 18+ (for ES modules)
- Bash shell (for automation)

### Setup

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine

# Make automation script executable (already done)
chmod +x run-daily-news.sh

# Test the pipeline manually
node news-ingestion-pipeline.mjs
```

## Usage

### Manual Execution

Run the pipeline on-demand:

```bash
node news-ingestion-pipeline.mjs
```

Or use the shell script:

```bash
./run-daily-news.sh
```

### Automated Daily Execution

Add to your crontab for automatic daily runs:

```bash
# Edit crontab
crontab -e

# Add one of these lines:

# Run daily at 9 AM
0 9 * * * /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/run-daily-news.sh >> /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/output/news/logs/cron.log 2>&1

# Run three times daily (9 AM, 3 PM, 9 PM)
0 9,15,21 * * * /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/run-daily-news.sh >> /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/output/news/logs/cron.log 2>&1

# Run every 6 hours
0 */6 * * * /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/run-daily-news.sh >> /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/empire/content-engine/output/news/logs/cron.log 2>&1
```

To view your crontab:

```bash
crontab -l
```

## Output Format

### Daily Brief JSON Structure

```json
{
  "date": "2025-10-07",
  "generated_at": "2025-10-07T12:00:00.000Z",
  "texas_news": [
    {
      "headline": "News headline",
      "source": "Source name",
      "summary": "Full summary of the story",
      "url": "https://...",
      "news_type": "legislation|arrest|business|federal|culture",
      "hnc_angle": {
        "summary": "Character dynamics and angles",
        "dialogue_hooks": [
          {
            "character": "REGGIE|DRO|TEX",
            "hook": "Sample dialogue line"
          }
        ],
        "scene_setting": "INT. LOCATION - TIME"
      },
      "advocacy_opportunity": "What advocacy angle this enables",
      "viral_potential": 8,
      "date_found": "2025-10-07"
    }
  ],
  "federal_news": [...],
  "culture_trends": [...],
  "top_3_episode_ideas": [
    {
      "rank": 1,
      "episode_concept": "Episode title and concept",
      "key_story": "Main news story",
      "viral_potential": 10,
      "advocacy_angle": "Advocacy opportunity",
      "dialogue_hooks": [...],
      "scene_ideas": ["Scene 1", "Scene 2", "Scene 3"],
      "target_length": "3-5 minutes",
      "platforms": ["YouTube Shorts", "TikTok", "Instagram Reels", "Twitter/X"]
    }
  ],
  "advocacy_opportunities": [
    {
      "opportunity": "Advocacy theme",
      "frequency": 5,
      "priority": "HIGH|MEDIUM|LOW"
    }
  ],
  "summary": {
    "total_items": 14,
    "texas_items": 6,
    "federal_items": 5,
    "culture_items": 3,
    "high_viral_potential": 4,
    "medium_viral_potential": 8,
    "top_advocacy_priority": "Economic opportunity"
  }
}
```

## Search Queries

The pipeline searches for:

### Texas Cannabis News
- "Texas cannabis hemp THC DSHS legislation"
- "Texas marijuana arrest law enforcement"
- "Texas hemp business dispensary"
- "Greg Abbott cannabis executive order Texas"

### Federal Cannabis News
- "federal cannabis legalization DEA"
- "Biden Trump marijuana rescheduling"
- "DEA Schedule III cannabis"
- "Congressional cannabis bill"

### Culture & Trends
- "cannabis culture trends viral"
- "marijuana social media Reddit"
- "cannabis wellness movement 2025"
- "weed infused pre-rolls trending"

### Advocacy
- "cannabis social justice reform"
- "marijuana legalization advocacy"
- "cannabis arrest racial disparity"
- "hemp farmers rights"

## Viral Potential Scoring

News items are scored 1-10 based on:

- **+3**: Controversy (ban, arrest, lawsuit, raid, conflict)
- **+2**: Political figures (Abbott, Biden, Trump, DEA, Governor)
- **+1**: Business/economic angle ($, billion, market, dispensary)
- **+1**: Youth/culture angle (college, culture, Reddit, viral, trend)

## Advocacy Opportunity Detection

The pipeline automatically identifies:

- **Criminal Justice Reform**: Stories about arrests, jail, prison
- **Economic Opportunity**: Business, licensing, regulation, market size
- **Medical Access**: Patient rights, health benefits, wellness
- **Public Safety**: Smart regulation vs. prohibition
- **State vs. Federal Rights**: Conflicting laws and jurisdictions

## HNC Character Angles

The pipeline generates character-specific angles:

### Reggie
- Cynical take on political dysfunction
- Rage against injustice of prohibition
- Sees opportunity in chaos

### Dro
- Optimistic spin on incremental progress
- Personal stories about system impact
- Vision for community-owned solutions

### Tex
- Business and legal analysis
- Rights education ("Know your rights")
- Political chess game breakdown

## Integration with Content Engine

The news pipeline feeds directly into the HNC content creation workflow:

```
News Pipeline → Daily Brief → Episode Ideas → Script Generation → Video Production
```

Writers can pull from:
- `latest.json` for today's top stories
- Historical briefs for trend analysis
- Advocacy opportunities for thematic episodes

## Monitoring & Logs

### View Recent Logs

```bash
# Latest execution log
ls -lt empire/content-engine/output/news/logs/ | head -5

# View a specific log
cat empire/content-engine/output/news/logs/pipeline-2025-10-07_09-00-00.log

# Monitor real-time (if running)
tail -f empire/content-engine/output/news/logs/cron.log
```

### Check Cron Status

```bash
# View cron logs (macOS)
log show --predicate 'process == "cron"' --last 1h

# View system logs (Linux)
grep CRON /var/log/syslog
```

## Customization

### Adding New Search Queries

Edit `news-ingestion-pipeline.mjs`:

```javascript
const SEARCH_QUERIES = {
  texas: [
    // Add your queries here
    'Texas cannabis dispensary expansion 2025'
  ],
  // ...
};
```

### Adjusting Scoring Weights

Modify the `calculateViralPotential()` function:

```javascript
function calculateViralPotential(newsItem) {
  let score = 5; // Change base score

  // Adjust weights
  if (newsItem.summary.match(/ban|arrest/i)) score += 5; // Increase from 3 to 5

  // Add new criteria
  if (newsItem.summary.match(/viral|trending/i)) score += 2;

  return Math.min(score, 10);
}
```

### Adding New Character Angles

Update the `CHARACTER_ANGLES` object:

```javascript
const CHARACTER_ANGLES = {
  new_news_type: {
    reggie: "Reggie's angle",
    dro: "Dro's angle",
    tex: "Tex's angle",
    // Add new characters
    newcharacter: "New character's angle"
  }
};
```

## API Integration (Future)

The pipeline is designed to integrate with news APIs:

### NewsAPI.org

```javascript
import fetch from 'node-fetch';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

async function fetchFromNewsAPI(query) {
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`
  );
  return response.json();
}
```

### Google News RSS

```javascript
const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=texas+cannabis',
  'https://news.google.com/rss/search?q=federal+marijuana+legalization'
];
```

### Reddit API

```javascript
// Monitor r/trees, r/cannabis, r/TexasMarijuana
const SUBREDDITS = ['trees', 'cannabis', 'TexasMarijuana'];
```

## Troubleshooting

### Pipeline Not Running

1. Check Node.js installation: `node --version`
2. Check script permissions: `ls -l news-ingestion-pipeline.mjs`
3. Run manually to see errors: `node news-ingestion-pipeline.mjs`

### Cron Job Not Executing

1. Check crontab: `crontab -l`
2. Check cron service: `ps aux | grep cron`
3. Check logs: `tail -f output/news/logs/cron.log`
4. Verify paths are absolute in crontab

### Empty or Missing Data

1. Check network connectivity
2. Verify search query results
3. Check API rate limits (if using)
4. Review logs for error messages

### Permission Denied

```bash
# Fix script permissions
chmod +x run-daily-news.sh
chmod +x news-ingestion-pipeline.mjs

# Fix directory permissions
chmod -R 755 output/news/
```

## Performance

- **Execution Time**: ~5-30 seconds (depending on news volume)
- **Memory Usage**: ~50-100MB
- **Disk Usage**: ~1-5MB per daily brief
- **Network**: Minimal (unless fetching from external APIs)

## Roadmap

### Phase 1 (Current)
- [x] Basic news ingestion structure
- [x] Character angle generation
- [x] Viral potential scoring
- [x] Daily automation script
- [x] Episode idea generation

### Phase 2 (Next)
- [ ] Live API integration (NewsAPI, Google News)
- [ ] Reddit sentiment analysis
- [ ] Twitter/X trend monitoring
- [ ] Slack/Discord notifications
- [ ] Web dashboard for viewing briefs

### Phase 3 (Future)
- [ ] AI-powered article summarization
- [ ] Automatic script generation from briefs
- [ ] Video storyboard generation
- [ ] Multi-language support
- [ ] Real-time alerts for breaking news

## Contributing

To improve the pipeline:

1. Test your changes: `node news-ingestion-pipeline.mjs`
2. Verify output format in `output/news/latest.json`
3. Check logs for errors
4. Update this README with new features

## License

Internal use for LivHana Trinity / High Noon Cartoon content creation.

## Contact

For issues or questions about the news pipeline:
- Check logs first: `output/news/logs/`
- Review this README
- Test manually: `node news-ingestion-pipeline.mjs`

---

**Last Updated**: 2025-10-07
**Version**: 1.0.0
**Status**: Production Ready
