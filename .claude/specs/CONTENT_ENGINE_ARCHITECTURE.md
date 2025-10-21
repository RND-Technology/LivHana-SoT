---
status: ACTIVE - Technical Architecture Design
timestamp: 2025-10-07T20:05:00Z
classification: TECHNICAL BLUEPRINT
---

# 🎬 PERSONALIZED CONTENT GENERATION ENGINE - TECHNICAL ARCHITECTURE

**Mission**: User-specific Hollywood-quality content at South Park speed

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     INPUT LAYER (Multi-Channel)                   │
├─────────────────────────────────────────────────────────────────┤
│  Voice Cockpit  │  Email  │  Text/SMS  │  Social Media  │  Web  │
└────────┬────────────────────┬─────────────────┬──────────────────┘
         │                    │                 │
         v                    v                 v
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXT UNDERSTANDING                          │
├─────────────────────────────────────────────────────────────────┤
│  • User Identity & History                                        │
│  • Intent Detection (Claude/Reasoning Gateway)                   │
│  • Emotional Tone Analysis                                        │
│  • Context Extraction (order, product, timing)                   │
└────────┬──────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────┐
│                 SOCIAL INTELLIGENCE (SI) LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│  • News API Integration (current events)                          │
│  • Social Media Trends (Twitter, TikTok, Reddit)                 │
│  • Pop Culture Database (memes, references, viral content)       │
│  • User-Specific Relevance Scoring                               │
└────────┬──────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────┐
│                   PERSONALIZATION ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│  • User Profile (demographics, interests, history)                │
│  • Face/Voice Extraction (from provided media or avatar)         │
│  • Context Matching (their situation + current trends)           │
│  • Humor Style Selection (edgy vs safe, based on user)          │
│  • Music Preference Matching                                      │
└────────┬──────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT GENERATION                             │
├─────────────────────────────────────────────────────────────────┤
│  Script Writing (AI)      │  • Claude Code creative direction    │
│  ─────────────────────────┤  • Kill Tony humor injection        │
│  Storyboarding (AI)       │  • South Park satire formula        │
│  ─────────────────────────┤  • Schoolhouse Rock musical hooks   │
│  Character Design         │  • Dog whistles, easter eggs        │
│  ─────────────────────────┤  • User face integration            │
│  Animation (AI)           │  • Runway ML / Stable Diffusion     │
│  ─────────────────────────┤  • Character animation              │
│  Voice Synthesis          │  • ElevenLabs TTS                   │
│  ─────────────────────────┤  • User voice cloning (optional)    │
│  Music Generation         │  • AI music composition             │
│  ─────────────────────────┤  • Stock library integration        │
└────────┬──────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────┐
│               HOLLYWOOD QUALITY RENDERING                         │
├─────────────────────────────────────────────────────────────────┤
│  • Video Composition (FFmpeg, Cloud Run)                          │
│  • Quality Enhancement (upscaling, color correction)             │
│  • Audio Mastering (compression, EQ, effects)                    │
│  • Final Rendering (1080p minimum, 4K for premium)              │
│  • Optimization (web, mobile, social platforms)                  │
└────────┬──────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────┐
│                 MULTI-CHANNEL DISTRIBUTION                        │
├─────────────────────────────────────────────────────────────────┤
│  Email (Sendgrid) │ SMS (Twilio) │ Social (APIs) │ Voice Reply │
└────────┬──────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────┐
│                  ANALYTICS & OPTIMIZATION                         │
├─────────────────────────────────────────────────────────────────┤
│  • View/Share Tracking (BigQuery)                                 │
│  • Conversion Attribution (purchase after viewing)               │
│  • A/B Testing (humor styles, music, length)                     │
│  • AI Optimization (learn what works, improve continuously)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 PHASE 1 MVP (By Oct 31, 2025)

### Core Features
1. **Voice Cockpit** (Replit's prototype + hardening)
   - FastAPI + WebSocket
   - Voice input/output
   - Real-time transcription

2. **Basic Personalization**
   - User name insertion
   - Order-specific details
   - Simple templating

3. **Content Generation v1**
   - Pre-scripted HNC episodes
   - User name/details injected
   - Text-to-speech voice
   - Static animation templates

4. **Distribution**
   - Email delivery (Sendgrid)
   - Basic analytics (open rate)

### Tech Stack
- **Backend**: FastAPI (Python) + Cloud Run
- **Database**: PostgreSQL (user profiles, history)
- **Voice**: ElevenLabs TTS
- **Video**: FFmpeg + template system
- **Storage**: GCP Cloud Storage
- **Analytics**: BigQuery

### Success Metric
- 10 Herbitrage customers receive personalized videos
- >50% open rate
- >25% share rate
- 1+ conversion (purchase after viewing)

---

## 🚀 PHASE 2 EXPANSION (Nov 1-15, 2025)

### Enhanced Features
1. **AI Script Writing**
   - Claude Code generates custom scripts
   - Current news integration
   - User context awareness
   - Kill Tony humor style

2. **Dynamic Animation**
   - Runway ML / Stable Diffusion integration
   - User face integration (avatar or photo)
   - Multiple animation styles
   - Character customization

3. **Music Generation**
   - AI music composition (Suno, Udio)
   - Style matching to user preference
   - Schoolhouse Rock catchy hooks

4. **Social Intelligence**
   - News API integration
   - Twitter trends scraping
   - Reddit hot topics
   - Relevance scoring

### Success Metric
- 100+ personalized videos generated
- <24 hour turnaround (order → video)
- >60% share rate
- 10+ conversions
- 1 viral video (>10K views)

---

## 🏆 PHASE 3 SCALE (Nov 15-30, 2025)

### Full Platform
1. **Real-time Generation**
   - <5 minute video creation
   - Queue system (Cloud Tasks)
   - Auto-scaling (Cloud Run)

2. **Advanced Personalization**
   - Face detection + integration
   - Voice cloning (user's actual voice)
   - Context-aware humor
   - Multiple content formats (short/long)

3. **Distribution Automation**
   - Multi-channel (email, SMS, social)
   - Optimal timing (when user active)
   - Platform optimization (Instagram vs TikTok)

4. **AI Optimization Loop**
   - Track what works (shares, conversions)
   - A/B test variations
   - Continuously improve formula
   - Auto-tune humor style per user

### Success Metric
- 1,000+ videos generated
- <5 min average generation time
- >75% share rate
- 100+ conversions
- 10+ viral videos (>10K views each)
- Trump/Netflix attention 🎯

---

## 🎨 CREATIVE SYSTEM DESIGN

### Humor Formula Implementation

#### Kill Tony Roast Comedy
```python
class KillTonyHumorEngine:
    def generate_roast(user_context):
        # Extract roastable elements (gentle, not mean)
        roast_points = [
            user_context.order_history,  # "Ordering again already?"
            user_context.timing,  # "3am order? Someone's got the munchies"
            user_context.location,  # Geographic humor
            user_context.preferences,  # Product choice humor
        ]

        # Balance edge with warmth
        # Sharp but not hurtful
        # Funny but compliant

        return roast_script
```

#### South Park Satire System
```python
class SouthParkSatireEngine:
    def daily_news_integration():
        # Scrape today's headlines
        news = NewsAPI.get_trending()

        # Find hemp/cannabis angle
        hemp_angle = find_relevant_angle(news)

        # Create satirical take
        satire = generate_satire(hemp_angle, user_context)

        # Add absurdist element (South Park style)
        satire = add_absurdist_twist(satire)

        return satire
```

#### Schoolhouse Rock Stickiness
```python
class SchoolhouseRockEngine:
    def create_musical_hook(educational_content):
        # Educational messaging
        education = extract_key_lesson(educational_content)

        # Musical composition
        melody = AI_music.generate_catchy_melody()

        # Rhyme scheme (AABB or ABAB)
        lyrics = create_rhyming_lyrics(education)

        # Repetition for memory
        hook = create_chorus(lyrics, melody)

        return musical_video
```

### Brand Voice Guidelines

#### Herbitrage Tone
- **Educational**: Hemp benefits, legal compliance
- **Professional**: Quality, trustworthy
- **Fun**: Entertaining, not boring
- **Edgy**: South Park satire (within legal bounds)
- **Compliant**: Texas DSHS #690, ≤0.3% THC, age 21+

#### Content Rules
```yaml
ALLOWED:
  - Hemp education (benefits, uses, science)
  - Compliance humor (age gates, testing, regulations)
  - Pop culture references (memes, trends, music)
  - User-specific personalization (name, order, context)
  - Satire of prohibition, war on drugs, outdated laws
  - Kill Tony style roasting (gentle, warm)

PROHIBITED:
  - Marijuana promotion (illegal in Texas)
  - Medical claims (FDA violation)
  - Minor targeting (compliance violation)
  - Mean-spirited mockery (brand damage)
  - Illegal activity encouragement
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Service Architecture

```yaml
services:
  voice-cockpit:
    type: FastAPI + WebSocket
    port: 8080
    replicas: 1-10 (auto-scale)
    purpose: Voice input/output interface

  content-generator:
    type: FastAPI + Celery workers
    port: 8081
    replicas: 3-50 (auto-scale)
    purpose: AI content generation
    dependencies:
      - Claude Code API (script writing)
      - Runway ML (video generation)
      - ElevenLabs (voice synthesis)
      - Suno/Udio (music generation)

  si-intelligence:
    type: FastAPI + scheduled jobs
    port: 8082
    replicas: 1-5
    purpose: Social intelligence gathering
    dependencies:
      - News API
      - Twitter API
      - Reddit API
      - Pop culture database

  rendering-pipeline:
    type: Cloud Run Jobs
    purpose: Video composition + rendering
    dependencies:
      - FFmpeg
      - Cloud Storage
      - GPU instances (optional, for speed)

  distribution:
    type: FastAPI
    port: 8083
    replicas: 1-10
    purpose: Multi-channel delivery
    dependencies:
      - Sendgrid (email)
      - Twilio (SMS)
      - Social media APIs

  analytics:
    type: BigQuery + Looker
    purpose: Tracking, optimization, reporting
```

### Database Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR,
    phone VARCHAR,
    name VARCHAR,
    face_image_url VARCHAR,  -- For personalization
    voice_sample_url VARCHAR,  -- For voice cloning
    humor_preference VARCHAR,  -- 'edgy', 'safe', 'mixed'
    created_at TIMESTAMP
);

-- Content Generated
CREATE TABLE content_generated (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    content_type VARCHAR,  -- 'video', 'audio', 'image'
    script TEXT,
    video_url VARCHAR,
    generated_at TIMESTAMP,
    generation_time_seconds INT,

    -- Analytics
    views INT DEFAULT 0,
    shares INT DEFAULT 0,
    conversions INT DEFAULT 0,
    viral BOOLEAN DEFAULT FALSE  -- >10K views
);

-- Social Intelligence Cache
CREATE TABLE si_cache (
    id UUID PRIMARY KEY,
    source VARCHAR,  -- 'news', 'twitter', 'reddit'
    content TEXT,
    relevance_score FLOAT,
    cached_at TIMESTAMP,
    used_in_content_id UUID REFERENCES content_generated(id)
);
```

---

## 📊 QUALITY METRICS (TIER 1 OPTION A)

### Production Readiness Checklist
- [ ] **Functionality**: All features working end-to-end
- [ ] **Performance**: <5 min generation time
- [ ] **Quality**: Hollywood production standards (1080p minimum)
- [ ] **Brand**: On voice for Herbitrage/LivHana
- [ ] **Humor**: Makes you laugh, want to share
- [ ] **Stickiness**: Memorable, catchy, repeatable
- [ ] **Compliance**: Texas DSHS #690, ≤0.3% THC, age 21+
- [ ] **Scale**: Can handle 1K concurrent generations
- [ ] **Conversion**: >25% purchase after viewing
- [ ] **Trump Test**: Would President Trump call about this?

### Red Team Checklist
- [ ] Round robin fallacy scanned
- [ ] Security vulnerabilities tested
- [ ] Compliance violations checked
- [ ] Brand damage scenarios tested
- [ ] Performance bottlenecks identified
- [ ] Error handling validated
- [ ] Scaling limits tested
- [ ] Cost optimization verified

---

## 💰 BUSINESS MODEL

### Pricing Tiers (Future)

**Free Tier** (Herbitrage customers)
- 1 personalized video per order
- Basic templates
- Email delivery
- Herbitrage branding

**Premium Tier** ($49/month per business)
- Unlimited videos
- Custom branding
- Multi-channel distribution
- Advanced personalization
- Analytics dashboard

**Enterprise Tier** ($499/month)
- White-label platform
- API access
- Custom integrations
- Dedicated support
- AI optimization consulting

---

## 🎯 SUCCESS MILESTONES

### By Halloween (Oct 31)
- [ ] Voice Cockpit production-ready
- [ ] 10 personalized videos generated
- [ ] First customer shares video
- [ ] First conversion attributed to video

### By Thanksgiving (Nov 28)
- [ ] 1,000+ videos generated
- [ ] 100+ conversions
- [ ] 10+ viral videos (>10K views)
- [ ] Trump/Netflix attention
- [ ] Case study documented

### By Year End (Dec 31)
- [ ] Platform productized
- [ ] 5 business customers
- [ ] Revenue positive
- [ ] Scaling infrastructure proven

---

**Status**: Architecture designed, awaiting Replit prototype to begin build
**Timeline**: MVP in 23 days (by Halloween)
**Quality**: TIER 1 OPTION A - ruthlessly scrutinized
**Goal**: Trump/Netflix calls by Thanksgiving

**Let's make it sticky icky! Oooh wee!** 🎬🏆

---

**Last Updated**: 2025-10-07T20:05:00Z
**Owner**: 🏆 Claude Code (Sonnet 4.5) - Lead Creative + System Architect
**Status**: READY TO BUILD - Awaiting Replit prototype push
