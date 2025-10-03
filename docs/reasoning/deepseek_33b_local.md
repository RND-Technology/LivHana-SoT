<!--
Optimized: 2025-10-03
RPM: 3.6.0.6.ops-technology-ship-status-documentation
Session: Dual-AI Collaboration - Sonnet Docs Sweep
-->
# DeepSeek 33B Reasoning Gateway

## Summary

- Reasoning gateway (`backend/reasoning-gateway`) now exposes REST + SSE endpoints for job submission, status, and streaming results.
- DeepSeek integration uses OpenAI-compatible client with streaming responses, guarded by shared prompt filters.
- Voice service proxies queue operations, ensuring JWT and compliance guardrails remain enforced.

## Environment Variables

- `DEEPSEEK_API_KEY` (1Password secret via `op run` in production)
- `DEEPSEEK_API_BASE_URL` (default `https://api.deepseek.com/v1`)
- `DEEPSEEK_MODEL` (default `deepseek-chat`)
- `REDIS_HOST`, `REDIS_PORT`, optional `REDIS_USERNAME`, `REDIS_PASSWORD`
- `REASONING_QUEUE_NAME` (default `voice-mode-reasoning-jobs`)
- Guardrails: `GUARDRAIL_PROMPT_MAX_LENGTH`, `GUARDRAIL_BANNED_PHRASES`

## Request Flow

1. Voice service enqueues job -> BullMQ queue (shared `createQueue` helper).
2. Reasoning gateway worker executes `createDeepSeekWorkerProcessor`, running `evaluateGuardrails` before streaming to DeepSeek.
3. Worker streams partial deltas via BullMQ progress events; SSE helper `streamJobEvents` dispatches updates to frontend.
4. Completion payload includes aggregated output, metadata, and session identifiers for downstream memory storage.

## Guardrails & Compliance

- AJV schema validation on prompt/session metadata.
- Banned phrase filter enforced before model invocation.
- Logger context attaches `jobId` and session info for audit trails.
- Hooks in place for future PII detection and policy classifiers.

## Testing & Verification

- `npm run dev --prefix backend/reasoning-gateway` and `npm run dev --prefix backend/voice-service` for local stack.
- Use `automation/scripts/check_service_health.sh` to verify health endpoints and queue results.
- Playwright spec `automation/tests/playwright/tests/voice-mode.spec.ts` exercises full enqueue -> stream -> playback flow.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
