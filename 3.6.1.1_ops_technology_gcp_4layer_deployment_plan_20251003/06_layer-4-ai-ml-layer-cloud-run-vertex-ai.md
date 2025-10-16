### Layer 4: AI/ML Layer (Cloud Run + Vertex AI)

```
┌─────────────────────────────────────────────────────────────┐
│ AI/ML LAYER - Voice + Content + Reasoning                  │
├─────────────────────────────────────────────────────────────┤
│ voice-service (Cloud Run)                                   │
│ ├── OpenAI TTS (voice generation)                         │
│ ├── Voice agent orchestration                              │
│ └── Real-time audio streaming                             │
│                                                             │
│ content-engine (Cloud Run)                                  │
│ ├── OpenAI DALL-E 3 (image generation)                    │
│ ├── Video composition (ffmpeg)                            │
│ ├── Text-to-video pipeline                                │
│ └── High Noon Cartoon content                             │
│                                                             │
│ reasoning-gateway (Cloud Run)                               │
│ ├── Claude Sonnet 4.5 integration                         │
│ ├── Autonomous decision engine                            │
│ └── Self-healing automation                               │
└─────────────────────────────────────────────────────────────┘
```

---
