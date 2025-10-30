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
