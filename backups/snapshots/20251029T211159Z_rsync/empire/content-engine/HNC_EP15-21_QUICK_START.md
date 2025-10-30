# HIGH NOON CARTOON EPISODES 15-21 - QUICK START GUIDE

**Status:** READY TO EXECUTE
**Production Time:** 4 hours (parallel) | 3 days (sequential)
**Total Cost:** $28.99 (7 episodes)

---

## FASTEST EXECUTION PATH (4 HOURS)

### Hour 1: Generate All Assets (9-10 AM)

**Music (Suno) - 20 minutes:**
1. Visit https://suno.com/create
2. Copy/paste prompts from main pipeline doc (Section 1)
3. Generate 7 tracks simultaneously
4. Download as: `episode-15.mp3` through `episode-21.mp3`

**Voiceover (ElevenLabs) - 10 minutes:**
1. Visit https://elevenlabs.io/speech-synthesis
2. Use voices: Adam (Jesse), Bella (Liv Hana), Josh (Lt. Dan)
3. Generate all voice lines (Section 3 of main doc)
4. Download and organize by episode

**Video (Runway) - Start 90-minute queue:**
1. Visit https://runwayml.com
2. Upload character reference images (Jesse, Liv Hana, Lt. Dan)
3. Queue 28 video scenes (Section 2 of main doc)
4. Let process in background

---

### Hours 2-3: Assembly While Videos Generate (10 AM-12 PM)

**Prepare Assembly Environment:**
```bash
# Create directory structure
mkdir -p output/{music,voices,video,final-videos,thumbnails}

# Organize downloaded assets
mv *.mp3 output/music/
# Move voice files to output/voices/episode-XX/
```

**FFmpeg Assembly Script:**
```bash
# Create assemble_episode.sh script (provided in main doc)
chmod +x assemble_episode.sh

# Once Runway videos complete, run:
for i in {15..21}; do ./assemble_episode.sh $i; done
```

**OR Manual Assembly (Premiere/Final Cut):**
1. Import assets for Episode 15
2. Timeline: 60 seconds, 1080x1920 (9:16)
3. Layer: Background video → Voiceover → Music (30% volume)
4. Add text overlays: Title, CTA, hashtags
5. Export: H.264, 10 Mbps, AAC 192k
6. Repeat for episodes 16-21

---

### Hour 4: Distribution (12-1 PM)

**YouTube Shorts:**
```
Title: "[Episode Title] | High Noon Cartoon #[Number]"
Description: [Episode summary] + CTA + Hashtags
Hashtags: #TexasTHC #StayTOONED #ReggieAndDro
Thumbnail: Upload 3 variants, enable A/B testing
Playlist: "High Noon Cartoon - Season 1"
```

**TikTok + Instagram Reels + X:**
- Same video file
- Caption: Hook line + Hashtags + CTA
- Post immediately or schedule for 2 PM release

---

## EPISODE QUICK REFERENCE

| Episode | Title | Music Theme | Key Character | Runtime |
|---------|-------|-------------|---------------|---------|
| **15** | Aubrey Awfuls Strikes Again | Upbeat Texas Country | Jesse + Liv Hana | 60s |
| **16** | Brick Weed Origins | Majestic Reveal | Jesse + Liv Hana | 60s |
| **17** | Lt. Dan's Compliance Lecture | Military March Comedy | Lt. Dan | 60s |
| **18** | Community Spotlight | Heartwarming Texas Folk | Jesse + Liv Hana | 60s |
| **19** | Industry Developments | Epic Texas Revolution | Jesse + Liv Hana | 60s |
| **20** | Did You Know? | Playful Educational | Narrator + Jesse + Liv | 60s |
| **21** | Week in Review | Dramatic Texas Western | Narrator + Jesse + Liv | 60s |

---

## COST BREAKDOWN

| Service | Per Episode | 7 Episodes |
|---------|-------------|------------|
| Suno Music | $0.10 | $0.70 |
| ElevenLabs Voiceover | $0.04 | $0.30 |
| Runway Gen-3 Video | $4.00 | $28.00 |
| **TOTAL** | **$4.14** | **$28.99** |

---

## KEY PROMPTS (COPY-PASTE READY)

### Episode 15: Music (Suno)

```
Style Description:
Upbeat Texas Country with comedic energy | Influences: Chris Stapleton, Zach Bryan, modern Texas country | BPM 128 | Key: G Major | bright energetic male vocals with warm country timbre | instrumentation: acoustic guitar (fingerpicking intro), electric guitar (clean Fender tone), upright bass (walking line), light percussion (snare on 2 and 4), harmonica accents | analog warmth; tape saturation; wide stereo acoustic guitars; centered vocals; natural reverb (barn/hall) | emotional arc: lighthearted fun → rising comedic tension → playful resolution | breath releases after lines; dynamic energy throughout; conversational delivery with Texas accent hints
```

### Episode 15: Voiceover (ElevenLabs)

**Jesse (Adam voice):**
- "Yo, I need some help running this empire..."
- "Deschedule cannabis, make Texas free, and sell some flower."

**Liv Hana (Bella voice):**
- "Live and faithful, boss. What's the mission?"
- "Roger that. Let's grow."

### Episode 15: Video Scene 1 (Runway)

```
Scene 1 (0-15s): Intro - Jesse overwhelmed at desk
Camera: Medium shot, slight push in
Setting: Modern office, desk cluttered with paperwork, computer screens
Character: Jesse (male, 30s, casual business attire, stressed expression)
Action: Jesse looks at camera, throws hands up in exasperation
Lighting: Warm office lighting, slightly chaotic atmosphere
Mood: Comedic overwhelm, relatable stress
Style: Realistic live-action, modern office comedy
```

---

## AUTOMATION SCRIPT

Save as `produce-episodes.sh`:

```bash
#!/bin/bash
# High Noon Cartoon Episodes 15-21 Production Script

echo "=== HIGH NOON CARTOON PRODUCTION ==="
echo "Episodes 15-21 | Week 3 Complete"
echo ""

# Step 1: Check assets
echo "[1/5] Checking assets..."
if [ ! -d "output/music" ] || [ ! -d "output/voices" ] || [ ! -d "output/video" ]; then
  echo "ERROR: Missing asset directories. Please generate assets first."
  exit 1
fi

# Step 2: Assemble episodes
echo "[2/5] Assembling episodes..."
for ep in {15..21}; do
  echo "  - Assembling Episode $ep..."
  ./assemble_episode.sh $ep
done

# Step 3: Generate thumbnails
echo "[3/5] Generating thumbnails..."
for ep in {15..21}; do
  ffmpeg -i "output/final-videos/HNC_EP0${ep}_FINAL.mp4" \
         -ss 00:00:05 -vframes 1 \
         "output/thumbnails/HNC_EP0${ep}_thumb_base.jpg" \
         -loglevel quiet
done

# Step 4: QA Check
echo "[4/5] Quality assurance..."
for ep in {15..21}; do
  FILE="output/final-videos/HNC_EP0${ep}_FINAL.mp4"
  if [ -f "$FILE" ]; then
    SIZE=$(du -h "$FILE" | cut -f1)
    DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FILE")
    echo "  ✓ Episode $ep: $SIZE, ${DURATION}s"
  else
    echo "  ✗ Episode $ep: MISSING"
  fi
done

# Step 5: Ready for distribution
echo "[5/5] Production complete!"
echo ""
echo "Next steps:"
echo "  1. Upload to YouTube Shorts"
echo "  2. Post to TikTok, Instagram, X"
echo "  3. Monitor performance metrics"
echo ""
echo "Total episodes produced: 7"
echo "Total cost: \$28.99"
echo ""
echo "STAY TOONED!"
```

Make executable: `chmod +x produce-episodes.sh`

---

## TROUBLESHOOTING

**"Suno generations sound off-key"**
- Regenerate 2-3 versions per prompt, select best
- Adjust BPM/Key in prompt if needed

**"Runway videos lack character consistency"**
- Upload character reference images before generating
- Use same reference image across all scenes per character

**"ElevenLabs voices sound robotic"**
- Adjust voice settings: stability 0.5, similarity_boost 0.75
- Use voice Adam (warm), Bella (clear), Josh (deep)

**"FFmpeg assembly fails"**
- Check file paths are correct
- Ensure all 4 video scenes exist per episode
- Verify audio files are MP3 format

**"Distribution takes too long"**
- Schedule posts instead of immediate upload
- Use automation tools (YouTube API, TikTok API)
- Divide episodes across team members

---

## SUCCESS CRITERIA

**Episode Ready When:**
- [ ] Video is 60 seconds, 1080x1920 (9:16)
- [ ] Voiceover audible, music at 30% volume
- [ ] Text overlays visible: title, CTA, hashtags
- [ ] Thumbnail generated (3 variants)
- [ ] File size < 50 MB
- [ ] No audio clipping or video stuttering

**Week 3 Success When:**
- [ ] All 7 episodes uploaded to 4 platforms
- [ ] YouTube Shorts: 10K+ views in 7 days (average)
- [ ] TikTok: 50K+ views in 7 days (average)
- [ ] Subscriber/follower growth visible
- [ ] ReggieAndDro.com traffic spike

---

## NEXT STEPS AFTER WEEK 3

1. **Analyze Performance:**
   - Which episodes had highest AVD?
   - Which music styles drove engagement?
   - Which CTAs drove clicks?

2. **Optimize Week 4 (Episodes 22-28):**
   - Double down on top-performing styles
   - A/B test learnings from Week 3
   - Adjust BPM/Key/Groove based on data

3. **Scale Production:**
   - Train additional team members
   - Automate more steps (API integrations)
   - Expand to 84 episodes (12-week series)

---

**READY TO PRODUCE?**

Full documentation: `HNC_EPISODES_15-21_PRODUCTION_PIPELINE.md`

**EXECUTE NOW. STAY TOONED.**

---

**Generated:** 2025-10-23
**Agent:** Claude Code (Sonnet 4.5)
**Status:** READY FOR PRODUCTION
