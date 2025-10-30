# Suno Music Analysis System
**Product Specification v1.0**

## Executive Summary

An AI-powered content production engine that analyzes music tracks created on Suno, providing real-time effectiveness scoring and optimization recommendations. The system combines agent-powered song analysis with web/social media trend detection to drive a daily audio-visual content pipeline targeting specific audiences.

**Core Value Proposition:** Transform raw Suno track creation into data-driven, audience-optimized content production through automated analysis and trend intelligence.

---

## Vision & Objectives

### Primary Goals
1. **Automated Quality Assessment** - Real-time analysis of Suno tracks through microphone input or file upload
2. **Trend-Responsive Content** - Web scraping and social media monitoring to identify emerging audio trends
3. **Daily Production Pipeline** - Systematic content generation targeting specific audience segments
4. **Optimization Feedback Loop** - Structured recommendations for track refinement and auto-tune application

### Target Outcomes
- Daily audio-visual content production at scale
- Data-driven decision making for track selection and refinement
- Reduced iteration time from creation to publication
- Audience-specific content optimization
- Measurable engagement correlation with analysis scores

---

## Analysis Framework

### Core Analysis Dimensions

#### 1. Lyrical Analysis
**Purpose:** Evaluate wordsmithing effectiveness and narrative impact

**Metrics:**
- **Word Picture Quality** (0-10): Vividness and imagery strength
- **Wordplay Effectiveness** (0-10): Clever phrasing, double meanings, metaphor usage
- **Narrative Coherence** (0-10): Story consistency and progression
- **Emotional Resonance** (0-10): Ability to evoke feelings
- **Memorability** (0-10): Quote-worthy phrases and sticky lyrics

**Output Example:**
```json
{
  "lyrical_analysis": {
    "word_picture_quality": 8.5,
    "wordplay_effectiveness": 7.0,
    "narrative_coherence": 9.0,
    "emotional_resonance": 8.0,
    "memorability": 7.5,
    "standout_lines": ["Texas made, never fade", "..."],
    "improvement_areas": ["Consider stronger metaphors in verse 2"]
  }
}
```

#### 2. Beat Structure & Effectiveness
**Purpose:** Assess rhythmic foundation and energy dynamics

**Metrics:**
- **Beat Consistency** (0-10): Rhythm stability and timing
- **Energy Progression** (0-10): Build-up and release dynamics
- **Drop Impact** (0-10): Climax effectiveness
- **Genre Alignment** (0-10): Fit with target style
- **Dance-ability** (0-10): Movement inspiration potential

**Analysis Points:**
- BPM appropriateness for genre
- Transition smoothness
- Energy peaks and valleys mapping
- Rhythmic complexity vs. accessibility balance

#### 3. Hook Addictiveness
**Purpose:** Quantify earworm potential and replay value

**Metrics:**
- **Catchiness Score** (0-10): Immediate memorability
- **Repetition Balance** (0-10): Optimal without oversaturation
- **Melodic Strength** (0-10): Tune memorability
- **Singalong Factor** (0-10): Ease of audience participation
- **First-Listen Impact** (0-10): Immediate hook registration

**Analysis Factors:**
- Hook placement timing (optimal: 0:15-0:30)
- Repetition frequency (optimal: 3-4 times)
- Melodic simplicity vs. interest balance
- Call-and-response opportunities

#### 4. Auto-Tune Application Quality
**Purpose:** Evaluate vocal processing effectiveness

**Metrics:**
- **Application Subtlety** (0-10): Natural vs. robotic balance
- **Pitch Correction Accuracy** (0-10): Clean note targeting
- **Genre Appropriateness** (0-10): Style alignment
- **Vocal Character Preservation** (0-10): Authenticity retention
- **Creative Effect Usage** (0-10): Artistic enhancement

**Evaluation Criteria:**
- Over-processing detection
- Formant preservation
- Vibrato handling
- Genre-specific standards (e.g., heavy for pop, light for indie)

#### 5. Vocal Balance & Presence
**Purpose:** Assess vocal mix positioning and clarity

**Metrics:**
- **Clarity Score** (0-10): Lyric intelligibility
- **Mix Position** (0-10): Vocal prominence appropriateness
- **Dynamic Range** (0-10): Volume variation effectiveness
- **Frequency Balance** (0-10): EQ optimization
- **Presence Factor** (0-10): Vocal "pop" in the mix

**Technical Checks:**
- Vocal-to-beat ratio
- Frequency masking issues
- Compression appropriateness
- Reverb/delay balance

#### 6. Overall Flow & Structure
**Purpose:** Evaluate track progression and structural cohesion

**Metrics:**
- **Structural Logic** (0-10): Verse/chorus/bridge arrangement
- **Pacing** (0-10): Tempo and energy timing
- **Transition Quality** (0-10): Section connectivity
- **Length Optimization** (0-10): Duration appropriateness
- **Climax Placement** (0-10): Peak moment timing

**Structural Analysis:**
- Intro effectiveness (hook within 30s?)
- Verse-to-chorus ratio
- Bridge necessity and placement
- Outro satisfaction
- Total runtime vs. platform optimization (TikTok: 15-60s, IG Reels: 15-90s)

---

## Trend Detection & Intelligence

### Web Scraping Targets
1. **Music Platforms**
   - Spotify trending charts
   - Apple Music top playlists
   - SoundCloud emerging artists
   - YouTube Music trending

2. **Social Media Signals**
   - TikTok audio trends and hashtag usage
   - Instagram Reels audio discovery
   - Twitter/X music conversation analysis
   - Reddit music community discussions (r/hiphopheads, r/popheads, etc.)

3. **Industry Sources**
   - Billboard charts
   - Genius lyrics annotations
   - Pitchfork reviews
   - Music production forums

### Trend Analysis Output
```json
{
  "trending_elements": {
    "lyrical_themes": ["authenticity", "regional pride", "hustle"],
    "production_styles": ["808-heavy beats", "minimalist hooks"],
    "vocal_techniques": ["melodic rap", "heavy auto-tune"],
    "tempo_ranges": [140-150 BPM],
    "track_lengths": ["2:30-3:00 optimal"],
    "audience_demographics": {
      "primary_age": "18-24",
      "geographic_focus": "Southern US",
      "platform_preference": "TikTok > Instagram"
    }
  }
}
```

---

## Use Cases

### Primary Use Case: Real-Time Analysis via Microphone
**Scenario:** Jesse plays a Suno track through speakers into microphone for live analysis

**Flow:**
1. User initiates analysis session: "Analyze this track"
2. System activates audio capture (30-120 second buffer)
3. Real-time transcription of lyrics
4. Audio feature extraction (beat, pitch, structure)
5. Multi-dimensional scoring across 6 framework dimensions
6. Structured feedback generation with specific improvement recommendations
7. Trend alignment comparison
8. Refinement suggestion output

**Example Interaction:**
```
User: "Analyze this track I just made"
System: [Listening... 45 seconds captured]
System: "Analysis complete. This is a Southern hip-hop track with strong regional pride themes.

SCORES:
- Lyrical Quality: 8.5/10 - Excellent word pictures ('Texas made')
- Beat Effectiveness: 7.5/10 - Solid 808 foundation, consider stronger drop
- Hook Addictiveness: 9.0/10 - Very catchy, optimal repetition
- Auto-Tune Application: 6.5/10 - Slightly heavy, reduce by 15%
- Vocal Balance: 8.0/10 - Good presence, slight muddiness at 2kHz
- Overall Flow: 8.5/10 - Strong structure, consider 15s trim for social

TREND ALIGNMENT: 85% match with current Southern hip-hop trends
RECOMMENDATION: Reduce auto-tune intensity, tighten to 2:45 for TikTok optimization"
```

### Secondary Use Case: Batch Analysis for Content Calendar
**Scenario:** Analyze multiple tracks to select optimal content for weekly posting schedule

**Flow:**
1. Upload 10-20 Suno tracks
2. Batch processing with parallel analysis
3. Comparative scoring and ranking
4. Audience-specific recommendations
5. Integration with RPM planning system
6. Content calendar population

### Tertiary Use Case: Trend-Responsive Track Refinement
**Scenario:** Real-time web scraping identifies emerging trend, system recommends track adjustments

**Flow:**
1. Trend detection system identifies spike in "regional pride" themes
2. Analysis of existing track library for alignment
3. Recommendation engine suggests specific lyrical/production modifications
4. User iterates on Suno with guided prompts
5. Re-analysis confirms improved trend alignment
6. Prioritization for immediate content calendar placement

---

## Architecture Options

### Option A: Standalone Microservice
**Architecture:** Independent service with REST/gRPC API

**Structure:**
```
suno-analysis-service/
├── api/
│   ├── endpoints/
│   │   ├── analyze_track.py
│   │   ├── batch_analyze.py
│   │   └── trend_detection.py
│   └── models/
│       └── analysis_schema.py
├── core/
│   ├── audio_processing/
│   │   ├── transcription.py
│   │   ├── feature_extraction.py
│   │   └── beat_detection.py
│   ├── analyzers/
│   │   ├── lyrical_analyzer.py
│   │   ├── beat_analyzer.py
│   │   ├── hook_analyzer.py
│   │   ├── autotune_analyzer.py
│   │   ├── vocal_analyzer.py
│   │   └── flow_analyzer.py
│   └── trend_detection/
│       ├── web_scraper.py
│       ├── social_monitor.py
│       └── trend_analyzer.py
├── ml_models/
│   ├── addictiveness_predictor.model
│   ├── genre_classifier.model
│   └── engagement_predictor.model
└── database/
    ├── tracks.db
    ├── analysis_history.db
    └── trend_cache.db
```

**Pros:**
- Independent scaling based on analysis load
- Technology stack flexibility (can use Python ML libraries without Node.js constraints)
- Easier to optimize for CPU-intensive audio processing
- Clear separation of concerns
- Can serve multiple clients beyond LivHana system

**Cons:**
- Additional deployment complexity
- Network latency for API calls
- Separate authentication/authorization layer needed
- More infrastructure to manage
- Potential for service communication failures

**Recommended Tech Stack:**
- Python 3.11+ (ML/audio processing ecosystem)
- FastAPI (async API framework)
- Librosa (audio analysis)
- OpenAI Whisper (transcription)
- Transformers (NLP for lyrical analysis)
- PostgreSQL (analysis history)
- Redis (trend caching)
- Docker containerization

---

### Option B: Integrated Agent Layer (Layer 1.6)
**Architecture:** New specialized agent within existing agent hierarchy

**Structure:**
```
backend/agents/
├── layer-1.5-research/
├── layer-1.6-music-analysis/  [NEW]
│   ├── music_agent.py
│   ├── analyzers/
│   │   ├── lyrical_analyzer.py
│   │   ├── beat_analyzer.py
│   │   ├── hook_analyzer.py
│   │   ├── autotune_analyzer.py
│   │   ├── vocal_analyzer.py
│   │   └── flow_analyzer.py
│   ├── trend_detection/
│   │   ├── web_scraper.py
│   │   └── social_monitor.py
│   └── integration/
│       ├── rpm_connector.py
│       └── content_calendar.py
└── layer-2-planning/
```

**Pros:**
- Seamless integration with existing agent communication patterns
- Direct access to RPM planning and content calendar systems
- Unified authentication and context management
- Leverages existing observability and monitoring
- Natural fit for conversational analysis flow

**Cons:**
- Constrained by Node.js/TypeScript ecosystem for ML tasks
- Shared resource pool with other agents
- Harder to independently scale audio processing workload
- Python audio libraries require subprocess/API boundary anyway
- Increases complexity of core agent system

**Implementation Approach:**
- Agent orchestrator with Python subprocess for heavy audio processing
- Core logic in TypeScript for agent communication
- Audio analysis delegated to Python workers
- Results cached in existing Redis infrastructure

---

### Option C: Hybrid Approach (RECOMMENDED)
**Architecture:** Lightweight agent (Layer 1.6) orchestrating standalone analysis service

**Structure:**
```
Layer 1.6 Agent (TypeScript)          Analysis Service (Python)
├── User interaction                  ├── Audio processing
├── Context management                ├── ML model inference
├── RPM integration                   ├── Feature extraction
├── Content calendar updates          └── Trend computation
└── Analysis request routing ──────────→ [API Gateway]
```

**How It Works:**
1. User requests analysis through agent conversation
2. Layer 1.6 agent receives request, manages context
3. Agent calls analysis microservice API
4. Microservice performs heavy audio/ML processing
5. Results returned to agent
6. Agent integrates results with RPM planning, content calendar
7. Agent presents findings conversationally to user

**Benefits:**
- Best of both worlds: conversational UX + optimized processing
- Agent layer handles integration complexity
- Microservice handles computational complexity
- Independent scaling where needed
- Clear interface boundary
- Python for ML/audio, TypeScript for orchestration

**Recommendation Rationale:**
- Audio processing and ML inference are CPU-intensive, better in Python
- Integration with existing systems (RPM, calendar) easier in agent layer
- Conversational interface natural for agent
- Future flexibility: microservice can serve other clients
- Simpler testing: service can be tested independently

---

## Integration Points

### 1. RPM Planning System
**Integration:** Analysis scores inform content priority and scheduling

**Data Flow:**
```
Analysis Results → Track Scoring → RPM Priority Calculation → Content Calendar
```

**Example:**
- Track with 9.0 hook addictiveness + 85% trend alignment = High priority
- Scheduled for peak engagement window
- Flagged for promotional boost

### 2. Content Calendar
**Integration:** Direct population of scheduled posts with optimized tracks

**Automation:**
- Daily analysis batch determines week's content lineup
- Auto-scheduling based on audience activity patterns
- Platform-specific optimization (TikTok vs. IG vs. YouTube)

### 3. Audience Targeting
**Integration:** Analysis dimensions mapped to audience segment preferences

**Mapping Example:**
```
Audience Segment: "Southern Hip-Hop Enthusiasts"
├── Preferred lyrical themes: Regional pride, authenticity
├── Beat preference: 140-150 BPM, 808-heavy
├── Auto-tune tolerance: Moderate to heavy
├── Platform: TikTok primary
└── Optimal length: 45-60 seconds

Track Match Score: 92%
```

### 4. Trend Detection Feed
**Integration:** Real-time trend data influences analysis scoring weights

**Dynamic Scoring:**
- Trend detection identifies "melodic rap" surge
- Lyrical analyzer increases weight for melodic phrasing
- Beat analyzer prioritizes melodic rhythm patterns
- Overall scores shift to favor trend-aligned tracks

---

## Technical Requirements

### Audio Processing Capabilities
- **Input Formats:** MP3, WAV, M4A, OGG
- **Microphone Capture:** Real-time audio recording (30-120s buffer)
- **Transcription:** Whisper API or local Whisper model
- **Feature Extraction:** Librosa for tempo, beat, pitch, spectral analysis
- **Waveform Analysis:** Beat detection, energy mapping, frequency analysis

### Machine Learning Models
1. **Addictiveness Predictor**
   - Training data: Historical engagement metrics correlated with audio features
   - Model type: Gradient boosting (XGBoost/LightGBM)
   - Input: Audio features + lyrical features
   - Output: Addictiveness score (0-10)

2. **Genre Classifier**
   - Model: Fine-tuned audio classification model (e.g., Wav2Vec2)
   - Purpose: Automatic genre detection for appropriate scoring context
   - Output: Genre label + confidence

3. **Engagement Predictor**
   - Training data: Social media engagement metrics
   - Model type: Neural network (multi-input: audio + metadata)
   - Output: Predicted likes, shares, comments

### Data Storage
- **Track Library:** S3/MinIO for audio files
- **Analysis History:** PostgreSQL for structured results
- **Trend Cache:** Redis for real-time trend data
- **User Preferences:** Existing user database

### API Requirements
- **REST Endpoints:**
  - POST /api/analyze/track (single track analysis)
  - POST /api/analyze/batch (multiple tracks)
  - GET /api/trends/current (latest trend data)
  - GET /api/analysis/history/{track_id}
  - POST /api/analyze/microphone (real-time capture)

- **WebSocket:**
  - /ws/analyze/live (streaming analysis for real-time feedback)

### Performance Targets
- **Single Track Analysis:** < 10 seconds
- **Batch Analysis (10 tracks):** < 60 seconds
- **Trend Detection Refresh:** Every 30 minutes
- **API Response Time:** < 500ms (excluding analysis processing)
- **Concurrent Analysis Capacity:** 10 simultaneous tracks

---

## Development Roadmap

### Phase 1: Core Analysis Engine (Weeks 1-4)
**Deliverables:**
- [ ] Audio processing pipeline (transcription, feature extraction)
- [ ] Lyrical analyzer implementation
- [ ] Beat analyzer implementation
- [ ] Hook analyzer implementation
- [ ] Basic scoring system
- [ ] REST API with single track endpoint
- [ ] Unit tests for each analyzer

**Success Criteria:**
- Can analyze uploaded track and return all 6 dimension scores
- Processing time < 15 seconds per track
- API stable with 95% uptime

### Phase 2: Advanced Analysis & ML Models (Weeks 5-8)
**Deliverables:**
- [ ] Auto-tune quality analyzer
- [ ] Vocal balance analyzer
- [ ] Flow structure analyzer
- [ ] Addictiveness prediction model (trained and deployed)
- [ ] Genre classifier integration
- [ ] Batch analysis endpoint
- [ ] Analysis history database

**Success Criteria:**
- All 6 analyzers operational
- Addictiveness predictor achieves >70% accuracy on validation set
- Batch processing functional for 10+ tracks

### Phase 3: Trend Detection System (Weeks 9-12)
**Deliverables:**
- [ ] Web scraping infrastructure
- [ ] Social media API integrations (TikTok, Instagram, Twitter)
- [ ] Trend aggregation and scoring algorithm
- [ ] Trend-influenced dynamic scoring weights
- [ ] Trend dashboard/visualization
- [ ] Automated trend reports

**Success Criteria:**
- Trend data refreshes every 30 minutes
- Identifies at least 5 emerging trends per day
- Trend alignment scoring functional

### Phase 4: Integration & Agent Layer (Weeks 13-16)
**Deliverables:**
- [ ] Layer 1.6 agent implementation (if hybrid approach)
- [ ] RPM planning integration
- [ ] Content calendar automation
- [ ] Audience targeting logic
- [ ] Microphone capture functionality
- [ ] Real-time analysis interface
- [ ] Conversational analysis UX

**Success Criteria:**
- Full integration with existing LivHana systems
- Real-time microphone analysis functional
- Content calendar auto-population working
- User can analyze track conversationally through agent

### Phase 5: Optimization & Polish (Weeks 17-20)
**Deliverables:**
- [ ] Performance optimization (sub-10s analysis)
- [ ] ML model refinement based on real-world usage
- [ ] Advanced recommendation engine
- [ ] A/B testing framework for scoring algorithms
- [ ] Comprehensive documentation
- [ ] User training materials

**Success Criteria:**
- Analysis time < 10 seconds
- User satisfaction > 85%
- System handles 50+ daily analysis requests
- Documented and ready for scale

---

## Success Metrics

### Immediate Metrics (Weeks 1-12)
- **Technical Performance:**
  - Analysis processing time
  - API uptime and reliability
  - Model inference accuracy

- **User Adoption:**
  - Number of tracks analyzed per day
  - User return rate for re-analysis
  - Feature utilization (which analyzers used most)

### Long-term Metrics (Months 3-12)
- **Content Performance:**
  - Correlation between analysis scores and actual engagement
  - High-scoring tracks vs. low-scoring tracks performance delta
  - Trend alignment accuracy (predicted vs. actual)

- **Business Impact:**
  - Daily content production velocity
  - Time saved per track (creation to publication)
  - Audience growth rate
  - Engagement rate improvement
  - Revenue impact (if monetized content)

### Model Performance Metrics
- **Addictiveness Predictor:**
  - MAE (Mean Absolute Error) < 1.0 on 0-10 scale
  - R² score > 0.7

- **Genre Classifier:**
  - Accuracy > 90% on top 10 genres
  - Precision/Recall > 85%

- **Engagement Predictor:**
  - Prediction accuracy within 20% of actual engagement
  - Directional accuracy (high vs. low performers) > 80%

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk 1: Audio Quality Variability**
- **Impact:** Poor audio input (microphone capture) degrades analysis accuracy
- **Mitigation:**
  - Implement audio quality pre-check
  - Provide user feedback on input quality
  - Support file upload as alternative to microphone
  - Noise reduction preprocessing

**Risk 2: ML Model Accuracy**
- **Impact:** Inaccurate predictions lead to poor recommendations, user distrust
- **Mitigation:**
  - Conservative confidence thresholds
  - Human-in-the-loop validation during training
  - Continuous model retraining with feedback data
  - Multiple model ensemble approaches

**Risk 3: API Dependency Failures**
- **Impact:** External services (Whisper, social APIs) unavailable
- **Mitigation:**
  - Fallback to local Whisper model
  - Caching of trend data (stale data better than none)
  - Graceful degradation (partial analysis vs. complete failure)
  - Circuit breaker patterns

### Product Risks

**Risk 4: User Expectation Mismatch**
- **Impact:** Users expect perfect song vs. reality of subjective music quality
- **Mitigation:**
  - Clear communication: "optimization guidance" not "perfection guarantor"
  - Show confidence intervals/uncertainty
  - Emphasize relative comparison vs. absolute scoring
  - Provide context for each score

**Risk 5: Trend Detection Noise**
- **Impact:** False positive trends lead to misguided content strategy
- **Mitigation:**
  - Multi-source trend validation
  - Trend persistence tracking (flash in pan vs. sustained)
  - Human editorial oversight for trend curation
  - Trend confidence scoring

### Business Risks

**Risk 6: Copyright/API Terms Violations**
- **Impact:** Social media scraping violates ToS, legal issues
- **Mitigation:**
  - Use official APIs where available
  - Respect robots.txt and rate limits
  - Legal review of scraping practices
  - Alternative: aggregate trend data from licensed sources

**Risk 7: Scale Economics**
- **Impact:** Audio processing costs exceed value delivered
- **Mitigation:**
  - Batch processing optimization
  - Caching of common analysis patterns
  - Tiered service (free basic, paid advanced)
  - GPU utilization optimization

---

## Open Questions for Engineering Handoff

1. **Architecture Decision:**
   - Confirm hybrid approach or prefer pure microservice?
   - If hybrid, define exact API contract between agent and service

2. **ML Model Sourcing:**
   - Train custom models or fine-tune pre-trained?
   - Acceptable model latency vs. accuracy trade-offs?
   - GPU budget for inference?

3. **Trend Detection Scope:**
   - Which platforms prioritize for v1? (Recommend: TikTok + Instagram only)
   - Scraping frequency? (Recommend: 30 min for v1, 5 min for v2)
   - Trend data retention policy?

4. **Integration Timing:**
   - Can RPM/content calendar integration wait until Phase 4?
   - Or needed earlier for validation?

5. **User Experience:**
   - Command-line interface sufficient initially?
   - Web dashboard needed? (Recommend: Phase 5)
   - Real-time analysis feedback during playback? (Ambitious)

6. **Data Privacy:**
   - Audio files stored permanently or ephemeral?
   - User consent for trend analysis contribution?
   - GDPR considerations if expanding beyond personal use?

---

## Appendix: Example Analysis Output

### Full Analysis Report Structure
```json
{
  "track_id": "suno_track_20251027_001",
  "track_title": "Texas Made",
  "analysis_timestamp": "2025-10-27T14:32:10Z",
  "duration_seconds": 168,
  "
_detected": "Southern Hip-Hop",
  "overall_score": 8.2,

  "lyrical_analysis": {
    "word_picture_quality": 8.5,
    "wordplay_effectiveness": 7.0,
    "narrative_coherence": 9.0,
    "emotional_resonance": 8.0,
    "memorability": 7.5,
    "overall_lyrical_score": 8.0,
    "standout_lines": [
      "Texas made, never fade, that's the legacy",
      "From the dirt to the stage, wrote my story in the clay"
    ],
    "themes_detected": ["regional pride", "perseverance", "authenticity"],
    "improvement_suggestions": [
      "Consider stronger metaphors in verse 2 (lines 15-20)",
      "Bridge lyrics feel generic, add personal specificity"
    ]
  },

  "beat_analysis": {
    "beat_consistency": 9.0,
    "energy_progression": 8.0,
    "drop_impact": 7.5,
    "genre_alignment": 9.5,
    "danceability": 8.5,
    "overall_beat_score": 8.5,
    "bpm": 145,
    "key": "E minor",
    "energy_map": {
      "intro": 4.5,
      "verse_1": 6.0,
      "chorus_1": 8.5,
      "verse_2": 6.5,
      "chorus_2": 9.0,
      "bridge": 7.0,
      "outro": 5.5
    },
    "improvement_suggestions": [
      "Drop at 1:12 could hit harder - suggest adding sub-bass layer",
      "Consider hi-hat variation in verse 2 for more interest"
    ]
  },

  "hook_analysis": {
    "catchiness_score": 9.0,
    "repetition_balance": 8.5,
    "melodic_strength": 8.0,
    "singalong_factor": 9.5,
    "first_listen_impact": 8.5,
    "overall_hook_score": 8.7,
    "hook_occurrences": 4,
    "hook_timing": [22, 68, 114, 152],
    "hook_length_seconds": 8,
    "improvement_suggestions": [
      "Hook is strong - consider making it the intro for immediate impact",
      "Fourth hook repetition could include call-and-response variation"
    ]
  },

  "autotune_analysis": {
    "application_subtlety": 6.5,
    "pitch_correction_accuracy": 9.0,
    "genre_appropriateness": 7.0,
    "vocal_character_preservation": 6.0,
    "creative_effect_usage": 7.5,
    "overall_autotune_score": 7.2,
    "autotune_intensity": "moderate-heavy",
    "artifacts_detected": ["slight robotic effect at 1:45-1:52"],
    "improvement_suggestions": [
      "Reduce auto-tune intensity by 15% - currently too robotic in bridge",
      "Consider manual pitch correction for sustained notes instead of heavy auto-tune",
      "Vibrato being suppressed - allow more natural vocal movement"
    ]
  },

  "vocal_balance_analysis": {
    "clarity_score": 8.0,
    "mix_position": 8.5,
    "dynamic_range": 7.5,
    "frequency_balance": 7.0,
    "presence_factor": 8.0,
    "overall_vocal_score": 7.8,
    "vocal_level_db": -6.5,
    "frequency_issues": ["slight muddiness around 2kHz"],
    "improvement_suggestions": [
      "Cut 2-3dB at 2kHz to clear up vocal muddiness",
      "Vocals sit well in mix, but could use slight high-shelf boost for air",
      "Compress vocals slightly more (ratio 3:1) for consistency"
    ]
  },

  "flow_structure_analysis": {
    "structural_logic": 9.0,
    "pacing": 8.5,
    "transition_quality": 8.0,
    "length_optimization": 7.0,
    "climax_placement": 8.5,
    "overall_flow_score": 8.2,
    "structure_detected": "Intro-Verse-Chorus-Verse-Chorus-Bridge-Chorus-Outro",
    "transition_timestamps": [15, 38, 62, 98, 122, 145],
    "climax_timestamp": 114,
    "improvement_suggestions": [
      "Track at 2:48 is slightly long for social media - trim to 2:30-2:45",
      "Consider cutting second verse by 4 bars for tighter pacing",
      "Intro could start with hook for immediate impact (social platforms)"
    ]
  },

  "trend_alignment": {
    "overall_alignment_score": 85,
    "matching_trends": [
      {
        "trend": "regional pride themes",
        "confidence": 92,
        "platforms": ["TikTok", "Instagram"],
        "velocity": "rising"
      },
      {
        "trend": "808-heavy production",
        "confidence": 88,
        "platforms": ["TikTok", "Spotify"],
        "velocity": "sustained"
      },
      {
        "trend": "melodic rap vocals",
        "confidence": 76,
        "platforms": ["TikTok", "YouTube"],
        "velocity": "rising"
      }
    ],
    "audience_match": {
      "primary_demographic": "18-24",
      "geographic_strength": "Southern US",
      "platform_recommendation": "TikTok",
      "posting_time_recommendation": "7-9pm CST"
    }
  },

  "recommendations": {
    "priority_changes": [
      {
        "priority": "high",
        "category": "auto-tune",
        "suggestion": "Reduce intensity 15% to sound less robotic"
      },
      {
        "priority": "medium",
        "category": "structure",
        "suggestion": "Trim to 2:30-2:45 for social media optimization"
      },
      {
        "priority": "medium",
        "category": "mix",
        "suggestion": "EQ cut at 2kHz for vocal clarity"
      }
    ],
    "optimization_for_platforms": {
      "tiktok": {
        "recommended_clip": "1:10-1:55 (hook + verse 2 + hook)",
        "length": 45,
        "caption_suggestion": "Texas pride hits different #TexasMade #HipHop #SouthernRap"
      },
      "instagram_reels": {
        "recommended_clip": "0:22-1:08 (hook + verse 1 + hook)",
        "length": 46,
        "caption_suggestion": "Born in the Lone Star. #TexasMusic #NewMusic"
      }
    },
    "next_steps": [
      "Re-export with reduced auto-tune",
      "Create 45s clip for TikTok (timestamp 1:10-1:55)",
      "Schedule for 7pm CST posting",
      "Target hashtags: #TexasMade, #SouthernHipHop"
    ]
  },

  "confidence_intervals": {
    "overall_confidence": 82,
    "notes": "Analysis confidence high. Microphone capture quality was good. Trend data current as of 2 hours ago."
  }
}
```

---

## Document History
- **v1.0** - 2025-10-27 - Initial specification based on voice session with Jesse
- **Author:** Claude (Agent Documentation System)
- **Reviewed By:** Pending Jesse review
- **Status:** Draft - Ready for architecture decision and engineering handoff

---

## Next Steps
1. **Architecture Decision:** Select hybrid vs. microservice approach
2. **Engineering Handoff:** Assign lead engineer, review technical requirements
3. **Resource Allocation:** Confirm ML engineer availability, GPU budget
4. **Timeline Approval:** Review 20-week roadmap, adjust based on priority
5. **Integration Planning:** Coordinate with RPM/content calendar teams
6. **Legal Review:** Confirm web scraping compliance
7. **Kickoff Meeting:** Phase 1 sprint planning

---

**Document Owner:** Jesse Niesen
**Technical Lead:** TBD
**Product Manager:** TBD
**Target Start Date:** TBD
