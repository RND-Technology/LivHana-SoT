### Parallel Work Streams (5 simultaneous)

```
┌─────────────────────────────────────────────────────────────┐
│ STREAM 1: Lightspeed → BigQuery Pipeline (CRITICAL)        │
│ STREAM 2: Customer Profile API                              │
│ STREAM 3: SI Recommendation Engine                          │
│ STREAM 4: Content-Commerce Bridge UI                        │
│ STREAM 5: Voice-to-Purchase (Stretch Goal)                  │
└─────────────────────────────────────────────────────────────┘
```

**Each stream follows**:
1. Read `.claude/PROMPT_1_SPEC_LOCK.md` → Create OpenAPI spec
2. Read `.claude/PROMPT_2_CODEGEN.md` → Write minimal code + tests
3. Read `.claude/PROMPT_3_RED_TEAM.md` → Attack & fix vulnerabilities
4. Deploy to Cloud Run with mock mode enabled
5. Document + test results + screenshots

---
