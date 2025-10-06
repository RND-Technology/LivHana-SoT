<!-- Optimized: 2025-10-03 13:36 PDT -->
<!-- RPM: 3.6.0.6.ops_technology_ship_status_documentation -->
<!-- Session: Tier-1 Cloud Cockpit Recovery -->

# 🎯 ULTIMATE STATE SNAPSHOT

**Updated:** October 03, 2025, 13:36 PM PDT
**Purpose:** Ground truth for the repo and operations—everything here comes with live commands so nothing relies on memory.

---

## ✅ ALWAYS VERIFY FIRST

1. Run the commands under *Live Git Status* and *Service Health* below.
2. Re-read `.claude/PERSISTENT_MEMORY.md` for operating rules and secret retrieval.
3. Update `.claude/SESSION_PROGRESS.md` with anything new you discover.

This file never replaces proof; it only points you to what needs verification.

---

## 🧾 LIVE GIT STATUS (run before trusting)

1. `git status -sb` — expect `## main...origin/main` and confirm clean working tree before handoff.
2. `git diff --stat` — review remaining edits; stage only after verification proof is logged.
3. `git log --oneline -5` — treat legacy commit messages as hints only; inspect diffs before trusting.

⭐ **Action:** Capture start/end `git status` output in `.claude/SESSION_PROGRESS.md` each session.

---

## 🌐 SERVICE HEALTH CHECKS

```
VOICE_URL=https://voice-service-<project>.run.app
REASONING_URL=https://reasoning-gateway-<project>.run.app
INTEGRATION_URL=https://integration-service-980910443251.us-central1.run.app

curl -sS "$VOICE_URL/health/voice-mode" | jq
curl -sS "$REASONING_URL/health" | jq
curl -sS "$INTEGRATION_URL/health" | jq
```

Record each command and output in `.claude/SESSION_PROGRESS.md`. Replace placeholder hostnames with active Cloud Run URLs before running.

If any endpoint fails, log it, gather logs (`gcloud run services logs read <service>`), and escalate via `.claude/HUMAN_IN_LOOP_WORKFLOW.md`.

---

## 🗂️ PRIORITY WORKSTREAMS (cross-check with RPM naming)

| Directory / File | Result Target | Immediate Action |
| --- | --- | --- |
| `1.2.1.8.local-delivery-api.20251002/` | Delivery API live in dev/staging | Bring up Docker stack, run integration health, capture proof. |
| `1.3.2.3.leafly-seo-profile.20251002/` | Leafly profile optimized | Execute optimization scripts, record metrics, update README with evidence. |
| `2.3.1.1.episode-001-texas-intro.20251002/` | Episode 1 assets produced | Generate voice + visuals, document pipeline steps. |
| `3.6.0.6.ops_technology_ship_status_documentation.md` | Ship status accurate | Update after each significant change; include command outputs. |
| `5.5.1.6.vcs-exit-materials.20251002/` | Exit data room ready | Inventory documents, confirm nothing stale. |

All names already conform to RPM DNA; use `.claude/RPM_DNA_QUICK_REFERENCE.md` before adding new assets.

---

## 🧠 MEMORY & HONESTY SYSTEM (single source files)

| File | Purpose | Status |
| --- | --- | --- |
| `.claude/PERSISTENT_MEMORY.md` | Operating rules, secrets handling. | Updated with metadata header—needs expansion review. |
| `.claude/HONESTY_IMPROVEMENT_SYSTEM_10-100X.md` | Honesty upgrade blueprint. | Keep open for reference during execution. |
| `.claude/EVIDENCE_PROTOCOL.md` | Proof standards. | Must be followed for every claim. |
| `.claude/HUMAN_IN_LOOP_WORKFLOW.md` | Escalation template. | Trigger once stuck >15 minutes. |

If a new file duplicates an existing purpose, merge it or move it to `.claude/archive/` immediately.

---

## 📋 SESSION LOGGING EXPECTATIONS

- Update `.claude/SESSION_PROGRESS.md` with timestamped command output as work progresses.
- Save Finder screenshots in `.evidence/` (create if missing) when visual proof is required.
- Use RPM metadata comments at the top of every modified file (already standardized).

---

## ⏳ AUTO-COMPACT & SAVING STATE

When token usage >85% or before stepping away:

1. Write key findings to `.claude/CURRENT_SESSION_STATE.md`.
2. Run `./auto-compact.sh` if log noise is high.
3. Ensure services are stopped (`docker compose down`) unless required to stay up.

---

## 🚨 WHEN TO STOP EVERYTHING

- A health check fails in production or staging environments.
- Evidence protocol cannot be satisfied (e.g., missing logs).
- RPM naming ambiguity remains after checking definitions.
- Human requests pause or override.

Document the reason, save state, and ping Jesse with the Human-in-Loop format.

---

**Precision, proof, and RPM alignment are non-negotiable. Keep the repo spotless and every claim backed by fresh evidence.**
