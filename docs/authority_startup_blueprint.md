# 🌪️ Liv Hana Tier‑1 Authority Startup Blueprint

Load this document at startup for every Cursor agent (voice orchestration, planning, CODEX). Principle‑of‑One is enforced everywhere. All status files live under `tmp/agent_status/` and are written atomically. **Claude Sonnet 4.5 OCT 2025** is the only permitted voice model.

--- 

## Layer 0 – 🧩 Bootstrap & Invariants
- Run `./START.sh` → `scripts/claude_tier1_boot.sh`.
- Checks (abort if any fail):  
  - `node -v` → major ≥ 20 (`STRICT_NODE_20=true` forces exact v20).  
  - `/opt/homebrew/bin` present in PATH top‑3; `which claude` ⇒ `/opt/homebrew/bin/claude`.  
  - `redis-cli` PING/SET/GET.  
  - `JWT_SECRET` present or loadable via `op run`.  
  - Sacred voice banner injected at the top of `tmp/claude_tier1_prompt.txt`.  
  - Voice launch flag `--model sonnet-4.5-oct-2025` (fail with remediation if missing).  
- Outputs: `logs/claude_tier1_boot_YYYYMMDD_HHMMSS.log`, append to `.claude/SESSION_PROGRESS.md`.
- Autospawn:  
  - `scripts/start_research_agent.sh` – research auto-launch.  
  - `scripts/agents/voice_orchestrator_watch.sh` – funnel watcher.

Atomic status JSON files live under `tmp/agent_status/` (`voice`, `planning`, `research`, `artifact`, `exec`, `qa`, `ops`, `funnel.ready`, `codex_tasks.json`). Use the guards in `scripts/guards/` for atomic writes, file locking, structure validation, and status schema checks. Canonical docs are registered in `docs/_index.md`.

---

## Layer 1.1 – 🎙️ Voice Orchestration Core (Sonnet 4.5 OCT 2025)
- **Model:** Claude Sonnet 4.5 OCT 2025 voice MCP (`claude-tier1 /voicemode:converse`).
- Duties: greet Jesse, capture directives, update `.claude/SESSION_PROGRESS.md`, emit `voice.status.json`, enforce the “silence = pause TTS” rule, poll status JSON & Redis events, and gate the funnel with Jesse’s voice approval.
- **Rule:** voice remains voice-only; all work is delegated to subagents.

### Subagents inside Layer 1.1
| ID | Role | Model | Responsibilities |
|----|------|-------|------------------|
| **1.1.1** | Planning Subagent | 🧠🤖 ChatGPT‑5 High Fast → GPT‑5 High | Builds PO1 task lists, dependencies, gaps. Updates `docs/tier1_recon_plan.md` and `tmp/agent_status/planning.status.json`. |
| **1.1.2** | Research Subagent | 🔬🤖 Networked GPT + Perplexity/Apify | Auto-launched via `scripts/start_research_agent.sh` with `claude-tier1 research --tools perplexity,apify`; maintains `docs/fallacy-scan.md`, risk register entries, and `tmp/agent_status/research.status.json`. |
| **1.1.3** | QA Subagent | 🛡️🤖 Claude Sonnet 4.5 OCT 2025 text / GPT‑4.1 | Monitors PO1 execution records. **Any update to `exec.status.json` auto-triggers QA.** Performs AC validation, security sweeps, regression tests. Writes `logs/qa/qa_agent_*.log`, updates `tmp/agent_status/qa.status.json`, notifies Planning (1.1.1). |
| **1.1.4** | Artifact + Execution Subagent | 🛠️🤖 Claude Code / GPT‑4.1 + ⚡🐆 Cheetah | Self-creation worker. CODEX applies repo edits (writes `tmp/agent_status/artifact.status.json`). Execution runs the 8-step runbook (preflight → lint → test → build → docker → Slack smoke → voice CLI smoke → `tmp/agent_status/exec.status.json`). Immediately signals QA (1.1.3) after writing the execution record. |

The Layer 1.1 core collects statuses from 1.1.1–1.1.4. Only when **Research** (1.1.2) and **QA** (1.1.3) report `status=passed` does the voice gate summarize the state to Jesse and request approval. Jesse’s voice approval sets `voice.status.json=approved`; rejection keeps it `blocked`.

---

## Layer 1.2 – 🧠 Cursor Planning Loop
- **Model:** Claude Sonnet 4.5 OCT 2025 in planning mode (Cursor).  
- Mirrors PO1 planning work, updates `docs/tier1_recon_plan.md` & `planning.status.json`, feeds Layer 1.1 subagents, maintains a direct loop with Jesse.

---

## Layer 2 – 🔬 Research Coordination Loop
- **Model:** Networked GPT (Perplexity/Apify).  
- Keeps research artifacts and citations synchronized (fallacy scan, risk register, `codex_tasks.json`, evidence ledger). Ensures CODEX tasks are queued properly.

---

## Layer 3 – 🛠️ CODEX Artifact Pit
- **Model:** Claude Code / GPT‑4.1 (external).  
- Reads `tmp/agent_status/codex_tasks.json`, applies diffs with PO1 guards, writes `tmp/agent_status/artifact.status.json`.

---

## Layer 4 – ⚡🐆 Execution Lightning (External Run)
- **Model:** Cheetah (fast executor).  
- Executes the runbook when triggered outside Layer 1.1.4: preflight → lint → test → build → docker → Slack smoke → voice CLI smoke → `tmp/agent_status/exec.status.json`.  
- **QA Auto-trigger:** the execution record is written using `atomic_write.sh`; the QA subagent (1.1.3) monitors that file and runs immediately. QA reports upstream to Planning (1.1.1) → Voice (Layer 1.1).

---

## Layer 5 – 🔁 Voice-Orchestrator Watcher
- Script: `scripts/agents/voice_orchestrator_watch.sh`.  
- Monitors `research`, `artifact`, `exec`, `qa` statuses; writes `tmp/agent_status/funnel.ready` when all are `passed`; signals Layer 1.1 to brief Jesse.

---

## Layer 6 – 🚀 Ops / Deployment (Human-in-loop)
- Human: Grasshopper Master CODEX (or CI Ops).  
- Uses `op run` with production secrets → deployment script (Cloudflare/Tailscale tunnel, service restart, `CHANGELOG.md`).  
- Writes `tmp/agent_status/ops.status.json`, logs to `logs/ops/*`.  
- 🔔 `scripts/agents/alert_ops.sh` notifies the human when QA passes and when deployment completes; voice orchestrator announces outcomes to Jesse.

---

## Acceptance Criteria Snapshot
- Bootstrap invariants pass; Sonnet 4.5 OCT 2025 enforced.
- Evidence ledger & fallacy scan updated with fresh entries.
- Research + QA status JSON valid; voice gate refuses to proceed without `passed`.
- Execution logs (preflight, lint, test, build, docker, Slack, voice) created; PO1 execution record updated.
- QA auto-trigger verified; `funnel.ready` produced before voice approval.
- PO1 guard clean; no secrets committed.
- Ops deployment recorded (`ops.status.json`, `CHANGELOG.md`).

---

## Optional Automation (Rube MCP)
- May orchestrate execution commands **only after** scaffolds and PO1 guard exist.
- Must read this blueprint, respect PO1, emit status JSON/Redis events.
- **Never** bypass the voice gate or modify the Sonnet 4.5 OCT model lock.

---

This document is the single authoritative startup reference. Keep it up to date, keep it registered in `docs/_index.md`, and ensure every agent reads it before executing. The unicorn race team stays in formation when this blueprint is obeyed. 🦄
