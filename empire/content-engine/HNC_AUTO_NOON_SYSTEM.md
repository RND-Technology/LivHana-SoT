# HNC AUTO-NOON PRODUCTION SYSTEM

**Target**: Generate 1 complete HNC episode (script → published video) in <30 minutes
**Status**: Implementation TODAY
**Updated**: 2025-10-08

---

## SYSTEM ARCHITECTURE

```
INPUT: Episode script + metadata
  ↓
[1. Music Generation] → Suno AI (2 min)
  ↓
[2. Character Images] → Midjourney (5 min)
  ↓
[3. Voice Generation] → ElevenLabs/Fish Audio (3 min)
  ↓
[4. Lip-Sync Animation] → HeyGen (8 min)
  ↓
[5. Video Assembly] → Kling AI (10 min)
  ↓
[6. Final Export] → 1080x1920 MP4 (2 min)
  ↓
OUTPUT: Ready-to-publish video
```

**Total Time**: 30 minutes per episode
**Automation Level**: 80% automated, 20% quality review

---

## IMMEDIATE TASKS (TODAY)

### Task 1: Generate 10 Test Soundtracks (Suno AI)

**Input Data**: `/empire/content-engine/HNC_84_Beat_Bomb_Master_v2.csv`

**Suno AI Prompts** (Episodes 1-10):

#### Episode 1: "Texas THC Origins"

```
Genre: Upbeat Texas Country
Tempo: 128 BPM
Key: G Major
Mood: Educational, Friendly, Warm
Instruments: Acoustic guitar, light percussion, harmonica
Duration: 60 seconds
Vibe: Modern educational content meets Texas pride
Tags: country, educational, upbeat, texas, acoustic
```

#### Episode 2: "Meet the Wall of Weed"

```
Genre: Majestic Reveal Theme
Tempo: 110 BPM
Key: D Major
Mood: Grand, Impressive, Professional
Instruments: Orchestral strings, brass, light synth
Duration: 60 seconds
Vibe: Product showcase with cinematic flair
Tags: cinematic, reveal, grand, professional
```

#### Episode 3: "Lt. Dan's Compliance Class"

```
Genre: Military March Comedy
Tempo: 140 BPM
Key: C Major
Mood: Disciplined, Humorous, Authoritative
Instruments: Marching drums, brass, military snare
Duration: 60 seconds
Vibe: Compliance education with comedic timing
Tags: military, comedy, march, educational
```

#### Episode 4: "Chief Steve's Panic Attack"

```
Genre: Nervous Comedy
Tempo: 150 BPM
Key: A Minor
Mood: Anxious, Comedic, Frantic
Instruments: Pizzicato strings, xylophone, nervous percussion
Duration: 60 seconds
Vibe: Comedic tension and bureaucratic panic
Tags: comedy, tension, quirky, anxious
```

#### Episode 5: "Liv Hana's Data Dashboard"

```
Genre: Tech Electronic
Tempo: 120 BPM
Key: E Minor
Mood: Futuristic, Clean, Analytical
Instruments: Synth, digital beats, ambient pads
Duration: 60 seconds
Vibe: AI assistant presenting data
Tags: electronic, tech, futuristic, data
```

#### Episode 6: "Jesse's First Customer"

```
Genre: Heartwarming Texas Folk
Tempo: 95 BPM
Key: F Major
Mood: Warm, Personal, Authentic
Instruments: Acoustic guitar, light strings, warm bass
Duration: 60 seconds
Vibe: Personal connection, customer stories
Tags: folk, heartwarming, acoustic, personal
```

#### Episode 7: "Aubrey Awfuls Strikes"

```
Genre: Villain Theme
Tempo: 100 BPM
Key: D Minor
Mood: Dark, Menacing, Corporate
Instruments: Low strings, ominous synth, tension-building percussion
Duration: 60 seconds
Vibe: Corporate villain entrance
Tags: dark, villain, tension, corporate
```

#### Episode 8: "Texas Hemp Farm Tour"

```
Genre: Agricultural Documentary
Tempo: 105 BPM
Key: G Major
Mood: Natural, Earthy, Educational
Instruments: Acoustic guitar, nature sounds, light percussion
Duration: 60 seconds
Vibe: Farm-to-table documentary style
Tags: natural, documentary, acoustic, earthy
```

#### Episode 9: "Industry News Roundup"

```
Genre: Epic Texas Revolution
Tempo: 130 BPM
Key: C Major
Mood: Energetic, Informative, Dynamic
Instruments: Guitar, drums, brass, modern synth
Duration: 60 seconds
Vibe: News broadcast with energy
Tags: news, energetic, broadcast, dynamic
```

#### Episode 10: "Fun Facts Friday"

```
Genre: Playful Educational Melody
Tempo: 115 BPM
Key: E Major
Mood: Fun, Lighthearted, Educational
Instruments: Ukulele, xylophone, light percussion, whistle
Duration: 60 seconds
Vibe: Educational trivia show
Tags: playful, fun, educational, light
```

**Action**: Generate these 10 tracks in Suno AI NOW

**Output Location**: `/empire/content-engine/output/music/episode-[01-10].mp3`

---

### Task 2: Jesse Character Sheet (Midjourney)

**Base Prompt**:

```
Professional man in early 40s, confident CEO personality, rolled-up sleeves button-down shirt in sage green (#8A9A5B) or burnt orange (#BF5700), dark blue jeans, leather boots, short brown hair with light beard, warm Caucasian skin tone (#F4C7A0), approachable Texas business owner aesthetic, clean modern style, 9:16 vertical format, professional lighting, photorealistic, detailed facial features, 4K quality --ar 9:16 --v 7
```

**20 Variations Needed**:

1. **Front view, neutral expression** (base reference)
2. **Front view, confident smile**
3. **Front view, explaining gesture (hand presenting)**
4. **Front view, excited expression**
5. **Front view, serious/concerned**
6. **3/4 view, looking at camera**
7. **3/4 view, gesturing to product**
8. **3/4 view, arms crossed confident**
9. **Side profile, professional stance**
10. **Talking head, mouth slightly open**
11. **Talking head, mid-speech**
12. **Upper body, pointing gesture**
13. **Upper body, thumbs up**
14. **Upper body, holding cannabis product (generic)**
15. **Full body standing, confident pose**
16. **Sitting at desk, professional**
17. **Walking forward, dynamic**
18. **In front of Wall of Weed background**
19. **Outdoor Texas landscape background**
20. **Close-up face, direct eye contact**

**Midjourney Workflow**:

```
1. Generate base image with prompt above
2. Use Omni Reference (--oref) for variations 2-20
3. Parameter: --ow 80 (strong reference adherence)
4. Save all 20 images with naming: jesse_01_front_neutral.png
```

**Output Location**: `/empire/content-engine/characters/jesse/`

---

### Task 3: Kling AI Sample Episode Test

**Test Episode**: Episode 1 - "Texas THC Origins"

**Production Steps**:

#### 3.1 Script Preparation

```
EPISODE 1: Texas THC Origins

SCENE 1 (0-15s):
JESSE (on camera, confident):
"Hey y'all, I'm Jesse from Reggie & Dro. You're watching High Noon Cartoon - 60 seconds of Texas cannabis compliance education."

SCENE 2 (15-35s):
JESSE (presenting):
"Texas hemp became legal in 2019. That means THC from hemp - like Delta-9 gummies - are 100% legal if they contain less than 0.3% THC by dry weight."

SCENE 3 (35-50s):
LIV HANA (appearing, data visualization):
"That's 0.3% THC per gram. A standard 10mg Delta-9 gummy? Totally legal."

SCENE 4 (50-60s):
JESSE (direct to camera):
"Know the law. Stay compliant. Stay TOONED for Episode 2 tomorrow!"
```

#### 3.2 Voice Generation (ElevenLabs)

```
Voice: Jesse (pNInz6obpgDQGcFmaJgB - Adam)
Lines:
- Scene 1 dialogue (5 seconds)
- Scene 2 dialogue (10 seconds)
- Scene 4 dialogue (5 seconds)

Voice: Liv Hana (EXAVITQu4vr4xnSDxMaL - Bella)
Lines:
- Scene 3 dialogue (8 seconds)

Export: episode-01-jesse-scene1.mp3, etc.
```

#### 3.3 Character Animation (HeyGen)

```
Upload: jesse_01_front_neutral.png
Audio: episode-01-jesse-scene1.mp3
Generate: Lip-synced video clip (5 seconds)

Repeat for all scenes
```

#### 3.4 Video Enhancement (Kling AI)

```
Input: HeyGen lip-synced clips
Enhancement: Add camera movement (slow push-in for emphasis)
Background: Texas landscape or store interior
Export: 1080x1920 MP4
```

#### 3.5 Music Integration

```
Soundtrack: episode-01.mp3 (from Suno AI)
Video editing tool: Add music layer
Balance: Voice primary, music supporting (-6db)
```

#### 3.6 Final Export

```
Format: MP4 (H.264)
Resolution: 1080x1920 (9:16)
Frame Rate: 30 FPS
Duration: 60 seconds
File Size: <100 MB
Captions: Embedded for accessibility
```

**Timeline Estimate**:

- Voice generation: 3 minutes
- HeyGen animation: 8 minutes (4 clips × 2 min each)
- Kling AI enhancement: 10 minutes
- Music + assembly: 5 minutes
- Export: 2 minutes
**Total: 28 minutes** ✅

---

## SUCCESS CRITERIA

**Episode 1 Production Test PASSES if**:

- ✅ Total production time <30 minutes
- ✅ Video quality: Broadcast-ready (1080p, clear audio)
- ✅ Character consistency: Jesse looks identical to reference
- ✅ Lip-sync: Natural, no uncanny valley
- ✅ Music: Professional, balanced with dialogue
- ✅ Export: Proper format for all platforms

**If test PASSES → Scale to daily production**
**If test FAILS → Identify bottleneck and optimize**

---

## AUTOMATION OPPORTUNITIES

### Immediately Automatable (Week 1)

1. **Music generation**: Batch all 84 episodes in Suno AI
2. **Character references**: Generate once, reuse forever
3. **Voice scripts**: Template-based generation
4. **Export settings**: Save as preset

### Next-Level Automation (Week 2)

1. **API integration**: Cursor IDE + Claude Code orchestration
2. **Batch processing**: Queue multiple episodes
3. **Platform publishing**: Automated cross-platform uploads
4. **Analytics tracking**: Auto-log performance metrics

---

## NEXT STEPS AFTER TODAY

**If Episode 1 completes <30 min**:

1. Generate Episodes 2-7 (rest of Week 1)
2. Publish to YouTube, TikTok, Instagram, X
3. Track performance metrics
4. Iterate based on audience feedback

**Then**:

- Weeks 2-12: Continue daily production (7 episodes/week)
- Total output: 84 episodes across 12 weeks
- Goal: Establish HNC as #1 Texas cannabis compliance education channel

---

## TOOLS REQUIRED (Active Today)

### Critical

- ✅ Suno AI subscription (music generation)
- ✅ Midjourney subscription (character design)
- ✅ ElevenLabs subscription (voice)
- ✅ HeyGen Creator (lip-sync)
- ✅ Kling AI Pro (video generation)

### Nice-to-Have

- Artlist Pro (backup music, already paid for year)
- Cursor IDE (automation)
- n8n (distribution automation - Week 2)

---

**STATUS**: READY TO EXECUTE
**BOTTLENECK PREDICTION**: Kling AI processing time (10 min per episode)
**MITIGATION**: Queue multiple episodes, use Runway as backup

---

*Last Updated: 2025-10-08*
*Target: <30 min episode production by END OF DAY*
*Success Metric: Episode 1 complete and publishable*
