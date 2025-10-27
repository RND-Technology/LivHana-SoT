<!-- 964b7ca4-84f9-46d4-902c-492a196e447f a0a7003c-6e1b-48a2-8d49-feb5a10332a9 -->
# Tier‑1 Replan (120/120 baseline, fallacies purged)

### Current truth (from logs)
- 120/120 health; 5/5 agents healthy (planning, research, artifact, execmon, qa)
- Voice mode UP (STT:2022, TTS:8880); Tier‑1 prompt pinned at top
- Integration‑service running with OAuth (R‑Series); secrets via GSM/1Password

### Purge (do NOT do)
- No token counters/context-map stubs, no fake agent boot scripts, no CCR proxy, no deep local LLM routing now. These solved the wrong problems and waste limits.

### Minimal hardening only
1) Claude CLI raw‑mode guard (prevent Ink error)
- In boot: skip auto‑launch unless interactive (test -t 0/1) or CLAUDE_AUTO_LAUNCH=1
- Default to CLAUDE_AUTO_LAUNCH=0; print pbcopy instructions only in non‑TTY

2) ExecMon is current; add heartbeat + rotation
- ExecMon writes updated_at every 60s via atomic_write; rotate/scrub logs/agents/execmon.log; respawn if tmux session missing

3) Integration‑service build/run alignment (R‑Series, ESM)
- tsconfig: target ≥ ES2017, module node16/esnext, moduleResolution node16, esModuleInterop & allowSyntheticDefaultImports true; outDir dist, rootDir src
- package.json: "type":"module"; start → node dist/src/server.js (or the actual compiled entry)
- Health: fast 200; SIGTERM graceful; bind 0.0.0.0:${PORT:-3005}
- OAuth: use R‑Series endpoints (api.lightspeedapp.com/API/Account/{ACCOUNT_ID}/...); refresh on 401; item‑ID secrets in .env.op; GSM for cloud
- BigQuery: validate JSON presence; fail with actionable hint if missing

4) Voice always‑on (optional)
- LaunchAgents for Whisper/Kokoro with absolute paths; KeepAlive true; safe bootout/bootstrap cycle; add simple voice watchdog

5) Secrets hygiene
- .env.op uses 1Password item IDs (no name ambiguity); de‑dupe LIGHTSPEED_* items; confirm GSM secret versions enabled

6) CI zero‑warning gate
- Workflow sets ALLOW_TEXT_ONLY=1; skips auto‑launch; verifies 5/5 agents via tmux + fresh status JSON; scrubs logs; secret scan

### Acceptance criteria
- No Ink raw‑mode error; manual launch instructions printed in non‑TTY
- ExecMon status JSON updated <60s; log file rotates; auto‑respawns on loss
- Integration‑service starts with node dist/src/server.js; /health 200; OAuth refreshes on 401; R‑Series endpoint passes a smoke request
- CI workflow green with text‑only voice gate; no secrets in logs

### Do‑now checks (no edits)
- Confirm R‑Series Account ID and OAuth scopes in GSM/1P
- Confirm current start entry (dist/src/server.js vs lightspeed‑bigquery.js)
- Confirm execmon.status.json updating every minute


### To-dos

- [ ] Guard Claude auto‑launch; skip when non‑interactive
- [ ] Add periodic heartbeat updated_at write and log rotation for ExecMon
- [ ] Align tsconfig ESM + start to node dist/src/server.js; health + SIGTERM
- [ ] Verify R‑Series endpoints + refresh‑on‑401; item‑ID secrets; GSM enabled
- [ ] Sanity check BigQuery JSON presence and fail‑fast hint
- [ ] Set ALLOW_TEXT_ONLY=1; validate 5/5 agents; scrub logs; secret scan
- [ ] (Optional) Add Whisper/Kokoro LaunchAgents + watchdog