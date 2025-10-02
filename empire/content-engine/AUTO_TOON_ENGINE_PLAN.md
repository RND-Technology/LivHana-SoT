# 🎬 AUTO-TOON ENGINE - LOCAL-ONLY BUILD PLAN
**Date:** October 2, 2025, 12:42 AM PDT
**Timeline:** 60 minutes to MVP
**Mode:** LOCAL ONLY (no public deployment)
**Cost Optimization:** Use existing paid assets

---

## 💰 COST OPTIMIZATION - YOUR PAID ASSETS

### ✅ **What You Already Have:**

1. **ElevenLabs API Key** ✅
   - Location: 1Password (retrieved)
   - Plan: Unknown (need to verify limits)
   - Use: Character voice generation
   - Cost: $0 (already paid)

2. **Artlist.io Annual Plan** ✅ BIG WIN!
   - What it is: Premium stock music/SFX library
   - Plan: Annual big plan (accidentally purchased = ASSET!)
   - Use: Background music, transitions, sound effects
   - Value: $300+/year (normally paid per track)
   - **This saves $10-50 per episode in music licensing!**

3. **OpenAI API Key** ✅
   - Already in use (Claude alternative)
   - Has DALL-E 3 access ($0.04/image)
   - Use: Static scene generation
   - Cost: ~$2/episode (50 images)

4. **Claude API Key** ✅
   - Already in use
   - Use: Script generation
   - Cost: ~$0.50/episode

### ❌ **What We DON'T Need (Yet):**

1. **Runway ML** ($95/month)
   - Why skip: Can start with static images + Ken Burns
   - Alternative: DALL-E 3 + FFmpeg animation
   - Save: $95/month

2. **Pika Labs** ($70/month)
   - Why skip: pika.art is correct URL, but not needed for MVP
   - Alternative: Start with slideshow style
   - Save: $70/month

**Total Savings:** $165/month in Phase 1

---

## 🎯 REVISED AUTO-TOON ENGINE (LOCAL MVP)

### **Stack (Using Your Assets):**

```
Episode Generator Pipeline
├── 1. Script Writer (Claude API) ✅ $0.50/episode
│   └── Generate dialogue, scene descriptions
├── 2. Voice Generator (ElevenLabs) ✅ Free (paid plan)
│   └── Character voices, narration
├── 3. Music/SFX (Artlist.io) ✅ Free (annual plan)
│   └── Background music, transitions, effects
├── 4. Visual Generator (DALL-E 3) ✅ $2/episode
│   └── Scene images, character poses
├── 5. Video Compositor (FFmpeg) ✅ Free (open source)
│   └── Ken Burns effects, transitions, audio sync
└── 6. Local Export ✅ Free
    └── MP4 files saved locally for review
```

**Cost Per Episode:** $2.50 (down from $50!)
**94% cost reduction by using existing assets!**

---

## 📊 PIKA.ART ANALYSIS

**Yes, https://pika.art/ is Pika Labs!**

**Pricing:**
- Free: 150 credits/month (3 videos)
- Standard: $10/month (700 credits)
- Pro: $35/month (2,000 credits)
- Unlimited: $70/month (unlimited)

**Decision:** Start FREE, upgrade if needed later
- 150 free credits = 3 test videos/month
- Good for testing before committing $70/month
- Keep this as Phase 2 upgrade option

---

## 🚀 60-MINUTE BUILD PLAN (LOCAL ONLY)

### **Minute 0-10: Setup**
- Retrieve ElevenLabs key from 1Password ✅
- Create content-engine directory structure
- Set up .env with API keys
- Verify FFmpeg installed

### **Minute 10-25: Script Engine (Agent 1)**
- Build Claude API script generator
- Episode template system
- Character dialogue formatter
- Scene description parser

### **Minute 25-35: Voice Pipeline (Agent 2)**
- ElevenLabs multi-voice integration
- Character voice selection
- Audio batch processing
- Export WAV files

### **Minute 35-45: Visual Generator (Agent 3)**
- DALL-E 3 scene generation
- Batch image creation
- Character consistency prompts
- Local image storage

### **Minute 45-55: Video Compositor (Agent 4)**
- FFmpeg slideshow builder
- Ken Burns pan/zoom effects
- Artlist.io music integration
- Audio sync with voiceover
- MP4 export

### **Minute 55-60: Test Episode 1**
- Generate 30-second test clip
- "Jesse testifies at Texas Capitol"
- 3 scenes, 2 characters (Jesse + Liv Hana)
- Background music from Artlist
- Local MP4 review

---

## 🎬 EPISODE 1 TEST SPEC (30 seconds)

**Title:** "Texas Truth - Cold Open"

**Script:**
```
SCENE 1: Texas Capitol exterior (day)
NARRATOR (Liv Hana): "April 7, 2025. Jesse Niesen testifies before the Texas Legislature."

SCENE 2: Hearing room interior
JESSE: "Cannabis sativa L is a plant, not a crime. Texas farmers deserve the right to grow hemp."

SCENE 3: Liv Hana hologram appears
LIV HANA: "The data supports Jesse's testimony. Hemp creates 15,000 Texas jobs and $2.3 billion in economic impact."

SCENE 4: Legislators react
NARRATOR: "But will Texas listen to facts... or fear?"

[TITLE CARD] "High Noon Cartoon - Coming Soon"
```

**Visuals:**
- 4 DALL-E 3 images (capitol, hearing room, Liv hologram, legislators)
- Ken Burns zoom effects
- Transition wipes

**Audio:**
- ElevenLabs voices (Jesse = authoritative, Liv = data-driven)
- Artlist.io dramatic country music
- Sound effects (gavel, murmurs)

**Length:** 30 seconds
**Cost:** ~$0.50 (DALL-E images + Claude script)

---

## 💻 DIRECTORY STRUCTURE

```
empire/content-engine/
├── src/
│   ├── script-generator.js      # Claude API script writer
│   ├── voice-generator.js       # ElevenLabs integration
│   ├── visual-generator.js      # DALL-E 3 image creation
│   ├── video-compositor.js      # FFmpeg pipeline
│   └── episode-orchestrator.js  # Main workflow
├── templates/
│   ├── episode-template.json    # Episode structure
│   └── character-voices.json    # Voice mappings
├── output/
│   ├── scripts/                 # Generated scripts
│   ├── audio/                   # Voice clips
│   ├── images/                  # Scene images
│   └── videos/                  # Final MP4 files
├── .env                         # API keys
├── package.json
└── README.md
```

---

## 🔑 HUMAN ACTIONS NEEDED

### **1. Verify Artlist.io Access (2 min)**
```
Go to: https://artlist.io/
Log in with your account
Verify: Can download music/SFX?
If yes: You have UNLIMITED music for episodes! 🎉
```

### **2. ElevenLabs Plan Check (1 min)**
```
Go to: https://elevenlabs.io/
Log in with your account
Check: Character limit remaining?
If >10K characters: Perfect for testing
If <10K: May need to upgrade for full episodes
```

### **3. Approve Episode 1 Test Spec (1 min)**
```
Review script above
Approve or modify:
- Title: "Texas Truth - Cold Open" (yes/no?)
- Characters: Jesse + Liv Hana (yes/no?)
- Length: 30 seconds (yes/no?)
- Tone: Dramatic but factual (yes/no?)
```

### **4. Set Budget Limit (30 sec)**
```
Phase 1 (MVP): $10/month budget?
- DALL-E images only
- No Runway/Pika yet
- Artlist + ElevenLabs free (existing plans)
```

---

## ⚡ READY TO BUILD

**I have everything I need to start:**
- ✅ ElevenLabs key: Retrieved
- ✅ OpenAI key: Exists in .env
- ✅ Claude key: Active
- ✅ Artlist: You have access
- ✅ FFmpeg: Available
- ✅ Architecture: Designed

**Waiting on:**
1. Your confirmation: "GO BUILD IT"
2. Artlist.io login confirmation (can you download music?)
3. ElevenLabs character limit check (how many left?)
4. Episode 1 test approval (or modifications)

**Then:**
- 60 minutes to working auto-toon engine
- 75 minutes to Episode 1 test clip (30 sec)
- 90 minutes to full documentation

**Reply with: "GO BUILD IT" + Artlist/ElevenLabs status.**

**TIER 1. LOCAL ONLY. ALWAYS HIGHER.** 🚀🎬🤠

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->
