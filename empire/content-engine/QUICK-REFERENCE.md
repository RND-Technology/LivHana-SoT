# Video Production Pipeline - Quick Reference

**One-page cheat sheet for daily operations**

---

## 🚀 Quick Start

```bash
# 1. Setup (first time only)
./setup-pipeline.sh

# 2. Configure .env with your API keys
edit .env

# 3. Produce episode
./video-production-pipeline.mjs produce 1
```

---

## 📝 Common Commands

### Production

```bash
# Single episode
./video-production-pipeline.mjs produce 1

# Batch (sequential - recommended)
./video-production-pipeline.mjs batch 1 10

# Batch (parallel - faster but may hit rate limits)
./video-production-pipeline.mjs batch 1 10 --parallel
```

### Monitoring

```bash
# Show summary report
./monitor-production.mjs summary

# Show latest episode
./monitor-production.mjs latest

# List all episodes
./monitor-production.mjs list

# Cost trends
./monitor-production.mjs trends

# Export report
./monitor-production.mjs export report.json
```

### Testing

```bash
# Run test suite
node video-production-pipeline.test.mjs

# Test with debug mode
DEBUG=true ./video-production-pipeline.mjs produce 1
```

---

## 📂 File Locations

| What | Where |
|------|-------|
| Scripts | `output/high-noon-cartoon/episode_XXX.json` |
| Final Videos | `output/final-videos/HNC_EP001_FINAL.mp4` |
| Metrics | `output/metrics/episode_001_metrics.json` |
| Production Log | `output/production-log.json` |
| Cached Audio | `output/assets/audio/` |
| Cached Images | `output/assets/images/` |
| Cached Videos | `output/assets/video/` |

---

## 💰 Costs

| Service | Cost/Episode |
|---------|--------------|
| ElevenLabs | $0.15 |
| DALL-E 3 | $0.32 |
| D-ID | $1.25 |
| Suno | $0.10 |
| Other | $0.03 |
| **Total** | **~$1.85** |

**Monthly (20 episodes): ~$37**
**With caching: ~$31**

---

## 🔑 Required API Keys

```bash
# .env file
ELEVENLABS_API_KEY=...      # Get at elevenlabs.io
OPENAI_API_KEY=...          # Get at platform.openai.com
D_ID_API_KEY=...            # Get at studio.d-id.com
SUNO_API_KEY=...            # Contact for access

# Optional (for distribution)
YOUTUBE_REFRESH_TOKEN=...
TIKTOK_ACCESS_TOKEN=...
INSTAGRAM_ACCESS_TOKEN=...
```

---

## ⚡ Rate Limits

| Service | Limit |
|---------|-------|
| ElevenLabs | 60 req/min |
| OpenAI | 50 images/min |
| D-ID | 30 req/min |
| Suno | 10 req/min |

**Tip:** Use sequential batch processing to avoid hitting limits.

---

## 🎬 Episode Script Format

```json
{
  "id": 1,
  "title": "Episode Title",
  "scriptBeat": [
    "Jesse: \"First line of dialogue\"",
    "Liv Hana: \"Second line of dialogue\"",
    "Chief Steve: \"Third line\""
  ],
  "sunoMusic": "upbeat country western",
  "ctaText": "Visit LivHana.com!"
}
```

**Save as:** `output/high-noon-cartoon/episode_001.json`

---

## 🔧 Troubleshooting

### API Key Not Working

```bash
# Check if set
echo $ELEVENLABS_API_KEY

# Set temporarily
export ELEVENLABS_API_KEY=your-key
```

### FFmpeg Error

```bash
# Install FFmpeg
brew install ffmpeg              # macOS
sudo apt install ffmpeg          # Linux

# Verify
ffmpeg -version
```

### GCS Upload Failed

```bash
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Create bucket
gcloud storage buckets create gs://hnc-episodes-prod
```

### Rate Limit Hit

- Pipeline automatically waits and retries
- Avoid `--parallel` flag
- Reduce concurrent operations

### Out of Memory

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" ./video-production-pipeline.mjs produce 1
```

---

## 📊 Pipeline Stages

```
1. Load Script          → Parse JSON
2. Generate Voices      → ElevenLabs API (5-10s)
3. Generate Characters  → DALL-E 3 (10-15s)
4. Create Lip-Sync      → D-ID API (30-60s)
5. Generate Backgrounds → DALL-E 3 (10-15s)
6. Generate Music       → Suno API (20-30s)
7. Compose Video        → FFmpeg (30-60s)
8. Upload to GCS        → gcloud (10-20s)
9. Distribute           → YouTube/TikTok/Instagram (30-60s)

Total: ~3-5 minutes per episode
```

---

## 🎯 Best Practices

### Cost Optimization

- ✅ Reuse character images across episodes
- ✅ Use standard quality for backgrounds
- ✅ Cache all reusable assets
- ✅ Review metrics after each batch

### Reliability

- ✅ Use sequential batch processing
- ✅ Never disable retry logic
- ✅ Monitor error rates
- ✅ Test before production batches

### Performance

- ✅ Process during off-peak hours
- ✅ Clean temp files regularly
- ✅ Use fast FFmpeg presets
- ✅ Monitor disk space

### Security

- ✅ Never commit .env file
- ✅ Rotate API keys every 90 days
- ✅ Use service accounts for GCS
- ✅ Restrict API key permissions

---

## 🆘 Emergency Commands

```bash
# Kill stuck process
pkill -f video-production-pipeline

# Clean all temp files
rm -rf output/final-videos/temp

# Reset failed episode
rm output/metrics/episode_XXX_metrics.json
rm output/final-videos/HNC_EPXXX_FINAL.mp4

# Check disk space
df -h

# View real-time logs
tail -f output/production-log.json

# Check API key validity
curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/user
```

---

## 📚 Documentation

- **Full Guide:** [PRODUCTION_PIPELINE_IMPLEMENTATION.md](PRODUCTION_PIPELINE_IMPLEMENTATION.md)
- **Setup:** [README-PIPELINE.md](README-PIPELINE.md)
- **Environment:** [.env.example](.env.example)
- **Tests:** [video-production-pipeline.test.mjs](video-production-pipeline.test.mjs)

---

## 📞 Support Checklist

Before asking for help:

1. ✅ Check [PRODUCTION_PIPELINE_IMPLEMENTATION.md](PRODUCTION_PIPELINE_IMPLEMENTATION.md)
2. ✅ Review `output/production-log.json`
3. ✅ Check metrics: `output/metrics/episode_XXX_metrics.json`
4. ✅ Enable debug: `DEBUG=true`
5. ✅ Test with sample episode
6. ✅ Verify API keys are valid
7. ✅ Check rate limits haven't been hit
8. ✅ Ensure sufficient disk space

---

**Version:** 2.0.0
**Last Updated:** October 7, 2025
