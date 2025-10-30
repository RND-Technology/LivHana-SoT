# Video Production Pipeline

**Version 2.0.0** - Production-Ready AI Video Generation System

Generate professional animated videos automatically from scripts using AI services (ElevenLabs, DALL-E 3, D-ID, Suno) with FFmpeg composition and multi-platform distribution.

---

## Quick Start

### 1. Run Setup

```bash
cd empire/content-engine
./setup-pipeline.sh
```

This will:

- Check prerequisites (Node.js 18+, FFmpeg, Google Cloud SDK)
- Create directory structure
- Setup environment variables template
- Run initial tests

### 2. Configure API Keys

Edit `.env` and add your API keys:

```bash
# Required services
ELEVENLABS_API_KEY=your-key
OPENAI_API_KEY=your-key
D_ID_API_KEY=your-key
SUNO_API_KEY=your-key

# Optional distribution
YOUTUBE_REFRESH_TOKEN=your-token
TIKTOK_ACCESS_TOKEN=your-token
INSTAGRAM_ACCESS_TOKEN=your-token
```

See `.env.example` for complete configuration.

### 3. Create Episode Script

Create `output/high-noon-cartoon/episode_001.json`:

```json
{
  "id": 1,
  "title": "The Great Hemp Heist",
  "scriptBeat": [
    "Jesse: \"Welcome to LivHana!\"",
    "Liv Hana: \"Let's discuss compliance.\""
  ],
  "sunoMusic": "upbeat country western",
  "ctaText": "Visit LivHana.com!"
}
```

### 4. Produce Episode

```bash
./video-production-pipeline.mjs produce 1
```

---

## Features

### AI Services Integration

- **ElevenLabs** - High-quality character voice generation
- **DALL-E 3** - Character images and background scenes
- **D-ID** - Photorealistic lip-sync talking heads
- **Suno** - Background music generation
- **FFmpeg** - Professional video composition

### Production Features

- **Retry Logic** - Automatic retry with exponential backoff
- **Rate Limiting** - Respects all API rate limits
- **Cost Tracking** - Real-time cost monitoring (~$1.85/episode)
- **Progress Tracking** - Visual progress bar with ETA
- **Asset Caching** - Reuse characters/backgrounds across episodes
- **Error Recovery** - Graceful degradation and detailed logging

### Distribution

- **YouTube** - Automated upload with metadata
- **TikTok** - Content posting API integration
- **Instagram** - Reels via Graph API
- **Google Cloud Storage** - Scalable video hosting

---

## Usage

### Single Episode

```bash
# Produce episode 1
./video-production-pipeline.mjs produce 1
```

### Batch Production

```bash
# Sequential (recommended)
./video-production-pipeline.mjs batch 1 10

# Parallel (faster but may hit rate limits)
./video-production-pipeline.mjs batch 1 10 --parallel
```

### Programmatic

```javascript
import VideoProductionPipeline from './video-production-pipeline.mjs';

const pipeline = new VideoProductionPipeline();
const result = await pipeline.produceEpisode(1);

console.log(`Cost: $${result.cost.total}`);
console.log(`Video: ${result.gcsUrl}`);
```

---

## Cost Breakdown

Per-episode costs (60-second video):

| Service | Cost |
|---------|------|
| ElevenLabs (voices) | $0.15 |
| DALL-E 3 (images) | $0.32 |
| D-ID (lip-sync) | $1.25 |
| Suno (music) | $0.10 |
| Cloud/compute | $0.03 |
| **Total** | **$1.85** |

**20 episodes/month: $37.00**
**With caching: ~$30.70**

---

## Architecture

```
Script (JSON)
    ↓
ElevenLabs → Audio files (MP3)
    ↓
DALL-E 3 → Character images (PNG)
    ↓
D-ID → Lip-sync videos (MP4)
    ↓
DALL-E 3 → Background scenes (PNG)
    ↓
Suno → Background music (MP3)
    ↓
FFmpeg → Composite video
    ↓
GCS → Cloud storage
    ↓
YouTube/TikTok/Instagram → Distribution
```

---

## Directory Structure

```
empire/content-engine/
├── video-production-pipeline.mjs        # Main pipeline
├── video-production-pipeline.test.mjs   # Test suite
├── setup-pipeline.sh                    # Setup script
├── .env.example                         # Config template
├── PRODUCTION_PIPELINE_IMPLEMENTATION.md # Full docs
└── output/
    ├── high-noon-cartoon/               # Scripts
    ├── assets/                          # Generated assets
    │   ├── audio/                       # Voices + music
    │   ├── images/                      # Characters + backgrounds
    │   └── video/                       # Lip-sync videos
    ├── final-videos/                    # Completed episodes
    ├── metrics/                         # Performance data
    └── production-log.json              # Production history
```

---

## Testing

### Run Test Suite

```bash
node video-production-pipeline.test.mjs
```

Tests include:

- Unit tests for all components
- Integration tests for full pipeline
- Performance benchmarks
- API structure validation
- Error handling verification

### Manual Testing

```bash
# Dry run (without real API calls)
DEBUG=true ./video-production-pipeline.mjs produce 1

# Test specific components
node -e "import('./video-production-pipeline.mjs').then(m => {
  const p = new m.default();
  console.log(p.getCharacterPrompt('Jesse'));
});"
```

---

## Monitoring

### Metrics

Every episode generates detailed metrics:

```
output/metrics/episode_001_metrics.json
```

Contains:

- API call counts per service
- Cost breakdown
- Processing duration per step
- Error logs with stack traces
- Files generated

### Production Log

All episodes logged to:

```
output/production-log.json
```

Track:

- Success/failure rates
- Total costs
- Processing times
- Error history

---

## Troubleshooting

### Common Issues

**API Key Not Configured**

```bash
# Check environment
echo $ELEVENLABS_API_KEY

# Set temporarily
export ELEVENLABS_API_KEY=your-key
```

**FFmpeg Not Found**

```bash
# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

**Rate Limit Hit**

- Pipeline automatically waits and retries
- Avoid `--parallel` flag for large batches
- Check rate limits in `.env`

**D-ID Timeout**

- Videos take 30-60 seconds to process
- Pipeline polls automatically
- Check D-ID dashboard for status

**GCS Upload Failed**

```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Create bucket
gcloud storage buckets create gs://hnc-episodes-prod
```

---

## Best Practices

### Cost Optimization

1. **Cache assets** - Character images reused across episodes
2. **Use standard quality** - HD doubles image costs
3. **Batch common operations** - Generate shared backgrounds once
4. **Monitor metrics** - Review cost reports regularly

### Reliability

1. **Never disable retries** - APIs can be unreliable
2. **Use sequential batches** - Parallel risks rate limits
3. **Monitor error rates** - >10% indicates issues
4. **Test before production** - Run on sample episodes first

### Performance

1. **Reuse cached assets** - 20% cost savings
2. **Process off-peak** - Better API response times
3. **Clean temp files** - Prevent disk issues
4. **Use fast presets** - Balance quality vs speed

### Security

1. **Never commit .env** - Add to .gitignore
2. **Rotate keys** - Every 90 days
3. **Use service accounts** - For GCS operations
4. **Restrict API scopes** - Minimum permissions

---

## API Requirements

### Required APIs

| Service | Purpose | Cost | Setup Link |
|---------|---------|------|------------|
| ElevenLabs | Voice generation | $0.15/ep | [Get API Key](https://elevenlabs.io/app/settings) |
| OpenAI | Image generation | $0.32/ep | [Get API Key](https://platform.openai.com/api-keys) |
| D-ID | Lip-sync videos | $1.25/ep | [Get API Key](https://studio.d-id.com/account-settings) |
| Suno | Music generation | $0.10/ep | Contact for access |

### Optional Distribution

| Platform | Setup | Documentation |
|----------|-------|---------------|
| YouTube | OAuth 2.0 | [YouTube API](https://developers.google.com/youtube/v3) |
| TikTok | Developer app | [TikTok API](https://developers.tiktok.com) |
| Instagram | Facebook app | [Instagram API](https://developers.facebook.com/docs/instagram-platform) |

---

## Documentation

- **Full Implementation Guide**: [PRODUCTION_PIPELINE_IMPLEMENTATION.md](PRODUCTION_PIPELINE_IMPLEMENTATION.md)
- **Environment Setup**: [.env.example](.env.example)
- **Test Suite**: [video-production-pipeline.test.mjs](video-production-pipeline.test.mjs)

---

## Support

For issues or questions:

1. Check [PRODUCTION_PIPELINE_IMPLEMENTATION.md](PRODUCTION_PIPELINE_IMPLEMENTATION.md)
2. Review `output/production-log.json` for errors
3. Check metrics: `output/metrics/episode_XXX_metrics.json`
4. Enable debug mode: `DEBUG=true`

---

## Version History

### v2.0.0 (2025-10-07)

- Production-ready API integrations
- Full retry logic and rate limiting
- Cost tracking and metrics
- Multi-platform distribution
- Comprehensive test suite
- Complete documentation

### v1.0.0

- Initial placeholder implementation

---

**Maintained by:** LivHana Engineering Team
**License:** Proprietary
**Last Updated:** October 7, 2025
