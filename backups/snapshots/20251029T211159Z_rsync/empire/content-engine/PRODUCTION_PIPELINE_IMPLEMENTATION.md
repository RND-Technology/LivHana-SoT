# Video Production Pipeline - Implementation Guide

**Version:** 2.0.0
**Status:** Production-Ready
**Last Updated:** October 7, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Integrations](#api-integrations)
4. [Setup & Configuration](#setup--configuration)
5. [Usage](#usage)
6. [Cost Analysis](#cost-analysis)
7. [Monitoring & Metrics](#monitoring--metrics)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [API Reference](#api-reference)

---

## Overview

The Video Production Pipeline is a fully automated system for creating professional animated video content for the High Noon Cartoon series. It orchestrates multiple AI services to transform scripts into fully produced videos with:

- **Voice Generation** (ElevenLabs)
- **Image Generation** (DALL-E 3)
- **Lip-Sync Videos** (D-ID)
- **Background Music** (Suno)
- **Video Composition** (FFmpeg)
- **Multi-Platform Distribution** (YouTube, TikTok, Instagram)

### Key Features

- **Production-Ready API Integrations**: Real implementations for all services
- **Retry Logic**: Automatic retry with exponential backoff
- **Rate Limiting**: Respects API rate limits across all services
- **Cost Tracking**: Real-time cost monitoring per episode
- **Progress Tracking**: Visual progress indicators and ETA
- **Comprehensive Metrics**: Detailed performance and error tracking
- **Parallel Processing**: Optional parallel episode production
- **Caching**: Intelligent asset reuse to minimize costs

---

## Architecture

### Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    EPISODE SCRIPT (JSON)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Voice Generation (ElevenLabs)                      │
│  • Parse dialogue from script                               │
│  • Generate audio for each character line                   │
│  • Cache results for reuse                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Character Images (DALL-E 3)                        │
│  • Generate headshots for all characters                    │
│  • Cache and reuse across episodes                          │
│  • HD quality optional                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Lip-Sync Videos (D-ID)                            │
│  • Combine character images + audio                         │
│  • Generate talking head videos                             │
│  • Poll for completion (async processing)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Background Scenes (DALL-E 3)                       │
│  • Generate Texas-themed backgrounds                        │
│  • Multiple scenes for variety                              │
│  • Cache and reuse                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Background Music (Suno)                            │
│  • Generate style-matched instrumental                      │
│  • 60-second background track                               │
│  • Watermark-free commercial use                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Video Composition (FFmpeg)                         │
│  • Layer backgrounds and character videos                   │
│  • Add music and text overlays                              │
│  • Final encoding (1080p, optimized)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Cloud Storage (GCS)                                │
│  • Upload final video                                       │
│  • Set cache headers                                        │
│  • Generate public URL                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Multi-Platform Distribution                        │
│  • YouTube (public upload)                                  │
│  • TikTok (content posting API)                             │
│  • Instagram (reels via Graph API)                          │
└─────────────────────────────────────────────────────────────┘
```

### Class Architecture

```javascript
VideoProductionPipeline
├── RetryManager          // Retry logic with exponential backoff
├── RateLimiter          // API rate limiting
├── ProgressTracker      // Visual progress display
├── CostTracker          // Real-time cost tracking
└── ProductionMetrics    // Performance and error metrics
```

---

## API Integrations

### 1. ElevenLabs (Text-to-Speech)

**Purpose:** Generate character voice audio from text

**Implementation:**

```javascript
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Headers:
  - xi-api-key: YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "text": "Character dialogue here",
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75,
      "style": 0.0,
      "use_speaker_boost": true
    }
  }
```

**Response:** Binary audio stream (MP3)

**Cost:** ~$0.30 per 1000 characters

**Rate Limit:** 60 requests/minute

---

### 2. OpenAI DALL-E 3 (Image Generation)

**Purpose:** Generate character images and backgrounds

**Implementation:**

```javascript
POST https://api.openai.com/v1/images/generations
Headers:
  - Authorization: Bearer YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "model": "dall-e-3",
    "prompt": "Detailed image description",
    "n": 1,
    "size": "1024x1024",
    "quality": "standard",  // or "hd"
    "style": "vivid"        // or "natural"
  }
```

**Response:**

```json
{
  "data": [{
    "url": "https://oaidalleapiprodscus.blob.core.windows.net/..."
  }]
}
```

**Cost:**

- Standard: $0.040 per image
- HD: $0.080 per image

**Rate Limit:** 50 images/minute

---

### 3. D-ID (Lip-Sync Video)

**Purpose:** Create talking head videos from images and audio

**Implementation:**

**Step 1: Create Talk**

```javascript
POST https://api.d-id.com/talks
Headers:
  - Authorization: Basic YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "source_url": "data:image/png;base64,{base64_image}",
    "script": {
      "type": "audio",
      "audio_url": "data:audio/mpeg;base64,{base64_audio}"
    },
    "config": {
      "fluent": true,
      "pad_audio": 0,
      "stitch": true
    }
  }
```

**Response:**

```json
{
  "id": "talk-12345",
  "status": "created"
}
```

**Step 2: Poll Status**

```javascript
GET https://api.d-id.com/talks/{talk_id}
```

**Response (when done):**

```json
{
  "id": "talk-12345",
  "status": "done",
  "result_url": "https://d-id-talks-prod.s3.us-west-2.amazonaws.com/..."
}
```

**Cost:** ~$0.05 per second of video

**Processing Time:** 4x faster than real-time (100 FPS)

---

### 4. Suno (Music Generation)

**Purpose:** Generate background music

**Implementation:**

```javascript
POST https://api.sunoapi.com/api/v1/generate
Headers:
  - Authorization: Bearer YOUR_API_KEY
  - Content-Type: application/json
Body:
  {
    "prompt": "Instrumental music description",
    "make_instrumental": true,
    "wait_audio": true
  }
```

**Response:**

```json
{
  "audio_url": "https://cdn.sunoapi.com/..."
}
```

**Cost:** ~$0.10 per track

**Note:** Using third-party API (official API in development)

---

### 5. YouTube Data API v3

**Purpose:** Upload videos to YouTube

**Implementation:**

**Step 1: Get Access Token**

```javascript
POST https://oauth2.googleapis.com/token
Body:
  - client_id: YOUR_CLIENT_ID
  - client_secret: YOUR_CLIENT_SECRET
  - refresh_token: YOUR_REFRESH_TOKEN
  - grant_type: refresh_token
```

**Step 2: Upload Video**

```javascript
POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status
Headers:
  - Authorization: Bearer {access_token}
  - Content-Type: multipart/related; boundary="..."
Body: (multipart)
  - Part 1: Video metadata (JSON)
  - Part 2: Video file (binary)
```

**Cost:** Free (with quotas)

**Important:** Unverified projects upload to private by default

---

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

## Setup & Configuration

### Prerequisites

1. **System Requirements:**
   - Node.js 18+ or 20+
   - FFmpeg installed and in PATH
   - Google Cloud SDK (for GCS upload)
   - 4GB+ RAM
   - 10GB+ storage for assets

2. **API Accounts:**
   - ElevenLabs account with API key
   - OpenAI account with API key
   - D-ID account with API key
   - Suno API access (via third-party provider)
   - YouTube OAuth credentials
   - TikTok developer app with content posting access
   - Instagram/Facebook Business account with API access

### Environment Variables

Create a `.env` file in the project root:

```bash
# Core APIs
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=...
OPENAI_API_KEY=sk-...
D_ID_API_KEY=...
SUNO_API_KEY=...
SUNO_API_ENDPOINT=https://api.sunoapi.com/api/v1

# YouTube
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...

# TikTok
TIKTOK_ACCESS_TOKEN=...

# Instagram
INSTAGRAM_ACCESS_TOKEN=...
FACEBOOK_PAGE_ID=...

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Installation

```bash
# 1. Clone repository
cd empire/content-engine

# 2. Install dependencies (if any)
# npm install (currently uses only Node.js built-ins)

# 3. Make scripts executable
chmod +x video-production-pipeline.mjs

# 4. Verify FFmpeg installation
ffmpeg -version

# 5. Verify gcloud setup
gcloud auth list
gcloud config get-value project

# 6. Run tests
node video-production-pipeline.test.mjs
```

---

## Usage

### Single Episode Production

```bash
# Produce episode 1
./video-production-pipeline.mjs produce 1

# Produce episode 5
./video-production-pipeline.mjs produce 5
```

### Batch Production (Sequential)

```bash
# Produce episodes 1-10 sequentially
./video-production-pipeline.mjs batch 1 10
```

### Batch Production (Parallel)

```bash
# Produce episodes 1-10 in parallel
# ⚠️ Use with caution - may hit rate limits
./video-production-pipeline.mjs batch 1 10 --parallel
```

### Programmatic Usage

```javascript
import VideoProductionPipeline from './video-production-pipeline.mjs';

const pipeline = new VideoProductionPipeline();

// Produce single episode
const result = await pipeline.produceEpisode(1);
console.log('Episode complete:', result.gcsUrl);
console.log('Cost:', result.cost.total);

// Batch production
const results = await pipeline.produceBatch(1, 5);
console.log(`Completed: ${results.filter(r => r.status === 'completed').length}/5`);
```

---

## Cost Analysis

### Per-Episode Cost Breakdown

Based on a typical 60-second episode:

| Service | Usage | Cost |
|---------|-------|------|
| **ElevenLabs** | ~5 dialogue lines × 100 chars | $0.15 |
| **DALL-E 3** | 5 characters + 3 backgrounds | $0.32 |
| **D-ID** | 5 lip-sync videos × 5 sec | $1.25 |
| **Suno** | 1 music track | $0.10 |
| **YouTube** | Upload | $0.00 |
| **TikTok** | Upload | $0.00 |
| **Instagram** | Upload | $0.00 |
| **GCS** | Storage + egress | $0.01 |
| **Compute** | FFmpeg processing | $0.02 |
| **TOTAL** | | **~$1.85** |

### Cost Optimization Strategies

1. **Asset Caching:**
   - Character images: Reuse across all episodes (~$0.20 saved per episode)
   - Background scenes: Reuse common locations (~$0.12 saved per episode)
   - Potential savings: 17% per episode

2. **Batch Processing:**
   - Generate all character images once upfront
   - Generate common backgrounds once upfront
   - Use standard quality instead of HD for backgrounds

3. **Parallel Production:**
   - Risk: May hit rate limits requiring retries
   - Benefit: Faster overall completion

### Monthly Budget Estimate

For 20 episodes/month:

- **Without Optimization:** $37.00
- **With Optimization:** $30.70
- **Annual Cost:** $368.40

---

## Monitoring & Metrics

### Metrics Collected

The pipeline automatically tracks:

1. **Performance Metrics:**
   - Total duration per episode
   - Duration per step
   - API response times

2. **Cost Metrics:**
   - Cost per API service
   - Cost per episode
   - Running total

3. **API Metrics:**
   - Total API calls per service
   - Success/failure rates
   - Retry counts

4. **File Metrics:**
   - Audio files generated
   - Images generated
   - Videos generated

5. **Error Tracking:**
   - Error messages
   - Stack traces
   - Context (which step failed)

### Metrics Output

Metrics are saved to:

```
output/metrics/episode_001_metrics.json
output/metrics/episode_002_metrics.json
...
```

Sample metrics file:

```json
{
  "episodeNumber": 1,
  "timestamp": "2025-10-07T12:00:00.000Z",
  "metrics": {
    "totalDuration": 450.5,
    "apiCalls": {
      "elevenLabs": 5,
      "openai": 8,
      "dId": 5,
      "suno": 1
    },
    "filesGenerated": {
      "audio": 6,
      "images": 8,
      "videos": 5
    },
    "errors": []
  },
  "costs": {
    "breakdown": {
      "elevenLabs": 0.15,
      "openai": 0.32,
      "dId": 1.25,
      "suno": 0.10
    },
    "total": 1.82,
    "currency": "USD"
  }
}
```

### Production Log

All production events are logged to:

```
output/production-log.json
```

Sample log entry:

```json
{
  "episodeNumber": 1,
  "status": "completed",
  "duration": "15.5 minutes",
  "timestamp": "2025-10-07T12:15:30.000Z",
  "error": null,
  "cost": "$1.82",
  "apiCalls": 19
}
```

---

## Troubleshooting

### Common Issues

#### 1. API Key Not Configured

**Error:** `API key not configured`

**Solution:**

```bash
# Check environment variables
echo $ELEVENLABS_API_KEY
echo $OPENAI_API_KEY

# Set if missing
export ELEVENLABS_API_KEY=your-key-here
```

#### 2. FFmpeg Not Found

**Error:** `ffmpeg: command not found`

**Solution:**

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

#### 3. Rate Limit Exceeded

**Error:** `Rate limit reached, waiting...`

**Solution:**

- Wait for the rate limiter to clear (automatic)
- Reduce concurrent operations
- Avoid using `--parallel` flag

#### 4. D-ID Processing Timeout

**Error:** `D-ID processing timeout`

**Solution:**

- D-ID videos can take 30-60 seconds to process
- Check D-ID dashboard for status
- Increase timeout in `pollDIdStatus()` function

#### 5. GCS Upload Failed

**Error:** `Upload failed: permission denied`

**Solution:**

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Verify permissions
gcloud storage ls gs://hnc-episodes-prod/
```

#### 6. YouTube Upload Private

**Issue:** Videos upload but remain private

**Solution:**

- YouTube requires API audit for public uploads
- Apply for audit at: console.cloud.google.com
- Submit compliance documentation
- Once approved, videos will be public

#### 7. Memory Issues (Large Videos)

**Error:** `JavaScript heap out of memory`

**Solution:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" ./video-production-pipeline.mjs produce 1
```

### Debug Mode

Enable verbose logging:

```javascript
// Add at top of video-production-pipeline.mjs
process.env.DEBUG = 'true';
```

Or use Node.js built-in debugging:

```bash
node --trace-warnings video-production-pipeline.mjs produce 1
```

---

## Best Practices

### 1. Cost Management

- **Always cache assets:** Check for existing files before regenerating
- **Monitor costs:** Review metrics after each production
- **Use standard quality:** HD images double the cost
- **Batch common operations:** Generate shared assets once

### 2. Reliability

- **Never disable retry logic:** APIs can be unreliable
- **Monitor error rates:** >10% error rate indicates issues
- **Use sequential batch processing:** Parallel risks rate limits
- **Implement timeouts:** Prevent hanging on stuck operations

### 3. Performance

- **Reuse character images:** Save 20% on costs
- **Process during off-peak hours:** Better API response times
- **Use fast FFmpeg presets:** Balance quality vs. speed
- **Clean up temp files:** Prevent disk space issues

### 4. Security

- **Never commit API keys:** Use environment variables
- **Rotate keys regularly:** Every 90 days
- **Use service accounts:** For GCS operations
- **Restrict API scopes:** Minimum required permissions

### 5. Quality Control

- **Review first episodes manually:** Verify quality
- **Spot-check batch productions:** Random sampling
- **Monitor video length:** Should match expectations
- **Check audio sync:** D-ID lip-sync quality
- **Validate uploads:** Verify all platforms received video

---

## API Reference

### Main Methods

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

#### `produceBatch(startEpisode, endEpisode, parallel = false)`

Produces multiple episodes sequentially or in parallel.

**Parameters:**

- `startEpisode` (Number): First episode number
- `endEpisode` (Number): Last episode number
- `parallel` (Boolean): Process in parallel (default: false)

**Returns:** Array of episode results

---

#### `loadEpisodeScript(episodeNumber)`

Loads episode script from disk.

**Parameters:**

- `episodeNumber` (Number): Episode number

**Returns:** Script object

---

#### `generateVoices(script)`

Generates character voice audio using ElevenLabs.

**Parameters:**

- `script` (Object): Episode script

**Returns:** Array of audio file objects

---

#### `generateCharacterImages(script)`

Generates character headshots using DALL-E 3.

**Parameters:**

- `script` (Object): Episode script

**Returns:** Array of image file objects

---

#### `createLipSyncVideos(audioFiles, characterImages)`

Creates lip-synced videos using D-ID.

**Parameters:**

- `audioFiles` (Array): Audio file objects
- `characterImages` (Array): Character image objects

**Returns:** Array of video file objects

---

#### `composeVideo(options)`

Composes final video using FFmpeg.

**Parameters:**

```javascript
{
  script: Object,
  lipSyncVideos: Array,
  backgrounds: Array,
  music: Object,
  episodeNumber: Number
}
```

**Returns:** Path to final video file

---

### Utility Classes

#### `RetryManager`

Handles retry logic with exponential backoff.

```javascript
const retryManager = new RetryManager(maxRetries = 3, baseDelay = 1000);
await retryManager.executeWithRetry(operation, operationName);
```

#### `RateLimiter`

Enforces API rate limits.

```javascript
const rateLimiter = new RateLimiter(maxRequestsPerMinute = 60);
await rateLimiter.waitForSlot();
```

#### `CostTracker`

Tracks costs per API service.

```javascript
costTracker.addElevenLabsCost(characters);
costTracker.addDalleCost(isHd);
const report = costTracker.generateReport();
```

#### `ProductionMetrics`

Records performance and error metrics.

```javascript
metrics.recordApiCall('elevenLabs');
metrics.recordFileGeneration('audio');
metrics.recordError(error, context);
const report = metrics.finalize();
```

---

## Appendix

### A. Character Voice IDs (ElevenLabs)

| Character | Voice Name | Voice ID |
|-----------|------------|----------|
| Jesse | Adam | pNInz6obpgDQGcFmaJgB |
| Liv Hana | Bella | EXAVITQu4vr4xnSDxMaL |
| Chief Steve | Antoni | AZnzlk1XvdvUeBnXmlld |
| Lt. Dan | Josh | VR6AewLTigWG4xSOukaG |
| Aubrey | Josh | VR6AewLTigWG4xSOukaG |

### B. Video Specifications

**Final Video Output:**

- **Resolution:** 1920x1080 (1080p)
- **Frame Rate:** 30 fps
- **Codec:** H.264 (libx264)
- **Audio:** AAC, 192 kbps, 48kHz
- **Format:** MP4
- **Optimization:** Fast start enabled

**FFmpeg Settings:**

- **Preset:** slow (high quality)
- **CRF:** 20 (high quality)
- **Profile:** high
- **Level:** 4.2
- **Pixel Format:** yuv420p (universal compatibility)

### C. Directory Structure

```
empire/content-engine/
├── video-production-pipeline.mjs        # Main pipeline
├── video-production-pipeline.test.mjs   # Test suite
├── PRODUCTION_PIPELINE_IMPLEMENTATION.md # This guide
└── output/
    ├── high-noon-cartoon/               # Episode scripts
    │   ├── episode_001.json
    │   ├── episode_002.json
    │   └── ...
    ├── assets/                          # Generated assets
    │   ├── audio/                       # Voice files
    │   │   ├── ep1_line_1.mp3
    │   │   └── music/                   # Background music
    │   ├── images/                      # Character images
    │   │   ├── character_jesse.png
    │   │   └── backgrounds/             # Scene backgrounds
    │   └── video/                       # Lip-sync videos
    │       └── lipsync_ep1_line_1.mp4
    ├── final-videos/                    # Completed episodes
    │   ├── HNC_EP001_FINAL.mp4
    │   └── HNC_EP002_FINAL.mp4
    ├── metrics/                         # Performance metrics
    │   ├── episode_001_metrics.json
    │   └── episode_002_metrics.json
    └── production-log.json              # Production history
```

### D. Sample Episode Script Format

```json
{
  "id": 1,
  "title": "The Great Hemp Heist",
  "scriptBeat": [
    "Jesse: \"Welcome to LivHana, where compliance meets innovation.\"",
    "Liv Hana: \"Today we're discussing DEA regulations.\"",
    "Chief Steve: \"This sounds complicated!\""
  ],
  "sunoMusic": "upbeat country western",
  "ctaText": "Visit LivHana.com for compliant hemp products!"
}
```

### E. Support & Resources

- **ElevenLabs Docs:** <https://elevenlabs.io/docs>
- **OpenAI API Reference:** <https://platform.openai.com/docs>
- **D-ID Documentation:** <https://docs.d-id.com>
- **YouTube API:** <https://developers.google.com/youtube/v3>
- **TikTok API:** <https://developers.tiktok.com>
- **Instagram API:** <https://developers.facebook.com/docs/instagram-platform>
- **FFmpeg Documentation:** <https://ffmpeg.org/documentation.html>

---

**Document Version:** 2.0.0
**Pipeline Version:** 2.0.0
**Last Updated:** October 7, 2025
**Maintained By:** LivHana Engineering Team
