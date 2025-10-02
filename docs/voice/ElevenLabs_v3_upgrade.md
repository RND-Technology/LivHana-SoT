# ElevenLabs v3 Upgrade – Voice Mode Queue Integration

## Summary

- Voice service proxies ElevenLabs v3 synthesis via `/api/elevenlabs/synthesize` with JWT guardrails, logging, and shared validation.
- New reasoning bridge endpoints `/api/reasoning/enqueue`, `/api/reasoning/result/:id`, `/api/reasoning/stream/:id` forward requests to DeepSeek reasoning gateway using Redis queue isolation.
- Frontend `useReasoningJob` hook coordinates enqueue -> stream -> final result for Voice Panel.

## Environment Variables

- `ELEVENLABS_API_KEY`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_DEFAULT_VOICE_ID`
- `REASONING_GATEWAY_BASE_URL` (defaults to `http://localhost:4002/api/reasoning`)
- `REASONING_QUEUE_NAME` (defaults to `voice-mode-reasoning-jobs`)

## Flow Overview

1. Frontend submits prompt via `useReasoningJob` hook -> voice-service `/api/reasoning/enqueue`.
2. Voice service enqueues job with BullMQ (`createQueue`, `createQueueEvents`) and returns `jobId`.
3. Frontend opens SSE stream `/api/reasoning/stream/:jobId` for progressive updates while polling `/api/reasoning/result/:jobId` for fallback.
4. Reasoning gateway consumes queue, runs guardrails (`backend/common/guardrails`), invokes DeepSeek client, streams results back.
5. Voice service logs job completion and allows optional ElevenLabs playback of DeepSeek output.

## Agentic Patterns

- **Prompt chaining**: `useReasoningJob` composes prompts with session metadata before enqueue.
- **Routing**: Voice service routes to ElevenLabs vs DeepSeek queue based on endpoint.
- **Memory hooks**: Reasoning worker updates BullMQ progress for partial deltas.
- **Reflection**: SSE stream exposes incremental reasoning for downstream UI reflection.
- **Guardrails**: Shared module blocks invalid/banned prompts prior to DeepSeek invocation.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->
