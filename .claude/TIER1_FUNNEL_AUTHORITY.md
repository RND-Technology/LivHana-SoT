---
diataxis: reference
owner: Jesse Niesen (CEO)
enforced-by: PO1 Cleanup + Boot Scripts
canonical: true
last-reviewed: 2025-10-22
---

# 🦄 Tier-1 Unicorn Racing Funnel — Authority Copy

**Status**: CANONICAL - Loaded at every session startup
**Purpose**: Eight-layer orchestration funnel with bootstrap invariants, model specifications, and acceptance criteria
**Enforcement**: Embedded in `scripts/claude_tier1_boot.sh`, protected from PO1 cleanup

Embed at startup for every Cursor agent. Principle of One enforced; status flows machine-readable; Claude Sonnet 4.5 OCT gates every phase.

---

## Layer 0 — 🧩 Bootstrap & Invariants

**Entry Point**: `./START.sh` → `scripts/claude_tier1_boot.sh`

### Critical Pre-Flight Checks (abort with remediation on failure)

- **Node Version**: Major ≥ 20 (`STRICT_NODE_20=true` forces exact v20)
- **Homebrew Path**: `/opt/homebrew/bin` in PATH top-3; `which claude` ⇒ `/opt/homebrew/bin/claude`
- **Redis**: `redis-cli` PING/SET/GET operations validated
- **JWT Secret**: `JWT_SECRET` present or accessible via `op run`
- **Voice Banner**: Sacred voice banner at top of `tmp/claude_tier1_prompt.txt` (grep verified)
- **Model Enforcement**: Sonnet 4.5 OCT enforced — CLI with `--model sonnet-4.5`; abort if missing

### Outputs

- Boot logs: `logs/claude_tier1_boot_*.log`
- Session tracking: `.claude/SESSION_PROGRESS.md` (append-only)
- Auto-spawn scripts:
  - `scripts/start_research_agent.sh`
  - `scripts/agents/voice_orchestrator_watch.sh`

---

## Layer 1.1 — 🎙️🦄 Voice Cognition (Liv Hana / Sonnet 4.5 OCT ONLY)

**Actor**: Terminal Claude Code CLI `claude-tier1` running Sonnet 4.5 OCT voice mode

### Subagents Living Inside Layer 1.1

1. **Planning Subagent**: GPT-5 High Fast → GPT-5 High
2. **Research Subagent**: Perplexity/Apify fed
3. **QA Subagent** 🛡️: Sonnet 4.5 text / GPT-4.1 - auto-triggers after ANY execution

### Direct Loop

Two-way communication with Jesse, CEO

### Responsibilities

- **Auto-activate voice**: Greet per banner instructions
- **Capture directives**: Log Jesse's commands to `.claude/SESSION_PROGRESS.md`
- **Status emission**: Emit `tmp/agent_status/voice.status.json` (status: listening)
- **Silence protocol**: "silence" → pause TTS, keep mic + context live (NOT session end)
- **Status polling**: Monitor `tmp/agent_status/{research,exec,qa,ops}.status.json` + Redis `agent.events`
- **Gatekeeper role**: Only when Research & QA report `status=passed` does voice summarize and request Jesse's approval
  - Approval → `voice.status.json=approved`
  - Rejection → `blocked` (loop back to Planning)

---

## Layer 1.2 — 🧠 Cursor Agent (Sonnet 4.5 planning mode)

**Direct Loop**: Two-way with Jesse, CEO

**Coordination**: Works with Layer 1.1 for planning tasks

---

## Layer 2 — 🔬 Research Layer

**Actor**: Research Subagent (networked model + Perplexity/Apify tools)

### Launch

Auto-start via `scripts/start_research_agent.sh` (runs under `op run`)

**Command**:
```bash
claude-tier1 research --project LivHana-SoT --plan docs/tier1_recon_plan.md --tools perplexity,apify
```

### Helpers

- `backend/research-service/src/perplexity.ts`
- `backend/research-service/src/apify.ts`

### Optional MCP

- `tools/perplexity-mcp/`
- `tools/apify-mcp/`

### Outputs

- Research artifacts: `docs/fallacy-scan.md`
- Risk updates: Per research findings
- Status: `tmp/agent_status/research.status.json`
- Logs: `logs/research/*`
- Optional Redis events

### Direct Loop

With Jesse, CEO via Layer 1.1

---

## Layer 3 — 🛠️ Artifact Engineering (CODEX)

**Model**: Claude Code / GPT-4.1 (apply_patch only)

### Maintains

**Documentation**:
- `_index`
- Evidence ledger
- Fallacy scan
- Risk register
- Research tools
- Mobile control
- Agent orchestration
- ADRs

**Scripts**:
- `check_recent.sh`
- `guards/check_po1_files.sh`
- `claude_voice_session.sh`
- `mobile/*.sh`
- `start_{research,qa}_agent.sh`
- `agents/{emit_event,voice_orchestrator_watch,validate_status}.sh`
- `slack_smoke_test.sh`
- `docker_env_wrapper.sh`

**Code**:
- Slack bridge
- Redis consumer
- MCP scaffolds

### Outputs

- Clean diffs
- Verification notes
- Status: `tmp/agent_status/artifact.status.json`

### Direct Loop

With Jesse, CEO via Layer 1.1

---

## Layer 4 — ⚡🐆 Execution (Cheetah)

**Model**: Cheetah (Cursor's fastest executor)

**Principle**: Stop instantly on failure; log every step

### Execution Sequence (in order)

1. **Preflight**: `./START.sh` + `bash scripts/claude_tier1_boot.sh --dry-run`
   - Output: `logs/ci/preflight.log`

2. **Lint**: `npm run lint --workspaces`
   - Output: `logs/ci/lint.log`

3. **Test**: `npm run test --workspaces -- --runInBand`
   - Output: `logs/ci/test.log`

4. **Build**: `npm run build --workspaces`
   - Output: `logs/ci/build.log`

5. **Docker**: `docker-compose up -d` + health checks
   - Output: `logs/ci/docker.log`

6. **Slack Smoke Test**: `bash scripts/slack_smoke_test.sh`
   - Output: `logs/ci/slack_bridge.log`

7. **Voice CLI Status**: `bash scripts/claude_voice_session.sh status`
   - Output: `logs/ci/voice_cli.log`

8. **Status Emission**: Write `tmp/agent_status/exec.status.json`

9. **MANDATORY QA Trigger**: Auto-trigger QA via `scripts/start_qa_agent.sh` (never skip)

### Direct Loop

With Jesse, CEO via Layer 1.1

**Auto-triggers**: QA loop back to Layer 1.1

---

## Layer 5 — 🔔🚀 Ops/Deployment (HUMAN-IN-THE-LOOP)

**Actor**: Grasshopper Master CODEX (Ops human) or CI operator

### Path

`op run` with prod secrets → deployment script
- Cloudflare/Tailscale configuration
- Service restart procedures
- `CHANGELOG.md` updates

### Status

- Status file: `tmp/agent_status/ops.status.json`
- Logs: `logs/ops/*`

### Alerts

- 🔔 Notify Grasshopper when ready
- Voice announces to Jesse

---

## Cross-Layer Telemetry & Guardrails

### Status Schema

- **Contract**: `docs/agent-contracts.md`
- **Validator**: `scripts/agents/validate_status.sh`

### PO1 Guard

- **Script**: `scripts/guards/check_po1_files.sh`
- **Purpose**: Ensures only registered docs change
- **Enforcement**: Fails on secret patterns

### Evidence Ledger

- **Location**: `docs/evidence-ledger.md`
- **Helper**: `scripts/check_recent.sh`

### Fallacy Scan

- **Location**: `docs/fallacy-scan.md`
- **Sources**: Cites `docs/source-guide.md`

### Model Strategy

- **ADR**: `.claude/decisions/MODEL_STRATEGY_CLOSED_SI_vs_OPEN_AI.md`

---

## 🦄 Flow Map

```
🎙️ Layer 1.1 (Voice + 3 Subagents) ↔ Jesse
      ↓↑
🧠 Layer 1.2 (Cursor Planning) ↔ Jesse
      ↓↑
🔬 Layer 2 (Research) ↔ Jesse via 1.1
      ↓↑
🛠️ Layer 3 (CODEX Artifacts) ↔ Jesse via 1.1
      ↓↑
⚡🐆 Layer 4 (Cheetah Execution) ↔ Jesse via 1.1
      ↓ (auto-trigger QA)
🛡️ QA Subagent (inside Layer 1.1) validates, reports to voice
      ↓ (on pass)
🔔🚀 Layer 5 (Ops/Deploy) alerts Grasshopper ↔ Jesse via 1.1
```

---

## Acceptance Criteria

### ✅ Boot Invariants

- [ ] All bootstrap checks pass (Node, Redis, JWT, paths)
- [ ] Sonnet 4.5 OCT enforced across all agents
- [ ] Voice banner present at top of prompt

### ✅ Documentation

- [ ] Evidence ledger updated with session artifacts
- [ ] Fallacy scan includes source citations
- [ ] Research + QA status files valid

### ✅ Execution Pipeline

- [ ] Preflight passes with zero errors
- [ ] Lint/test/build produce clean logs
- [ ] Docker services healthy
- [ ] Slack smoke test succeeds
- [ ] Voice CLI operational

### ✅ Guardrails

- [ ] Guard script passes (no secrets, only registered docs)
- [ ] Voice gating enforced (Research + QA approval required)
- [ ] Status files conform to schema

### ✅ Deployment

- [ ] Ops deployment recorded in status file
- [ ] CHANGELOG.md updated with release notes
- [ ] Grasshopper notified via alert

---

## Model Assignments (Strict Enforcement)

| Layer | Primary Model | Fallback | Notes |
|-------|--------------|----------|-------|
| **0 - Bootstrap** | Bash/Python | N/A | System scripts only |
| **1.1 - Voice (Liv Hana)** | Sonnet 4.5 OCT | None | Voice mode required |
| **1.1 - Planning Sub** | GPT-5 High | GPT-5 High Fast | Universal taskmaster |
| **1.1 - Research Sub** | Perplexity/Apify | Sonnet 4.5 text | Networked intelligence |
| **1.1 - QA Sub** | Sonnet 4.5 text | GPT-4.1 | Validation only |
| **1.2 - Cursor** | Sonnet 4.5 | None | Planning mode |
| **3 - Artifacts** | Claude Code | GPT-4.1 | Docs/scripts only |
| **4 - Execution** | Cheetah | None | Fastest executor |
| **5 - Ops** | Human | N/A | HITL required |

---

## Emojis Legend

- 🧩 **Bootstrap**: Foundation layer
- 🎙️ **Voice**: Liv Hana voice orchestration
- 🦄 **Unicorn**: Racing funnel metaphor
- 🧠 **Cursor**: Planning agent
- 🔬 **Research**: Investigation layer
- 🛠️ **Artifacts**: CODEX engineering
- ⚡ **Execution**: Fast delivery
- 🐆 **Cheetah**: Speed emphasis
- 🛡️ **QA**: Quality guardrails
- 🔔 **Alert**: Human notification
- 🚀 **Deploy**: Production release
- 🦁 **Grasshopper**: Ops master

---

## Related Documentation

- Boot system: `docs/CLAUDE_TIER1_BOOT_SYSTEM.md`
- Voice protocol: `.claude/VOICE_MODE_SILENCE_PROTOCOL.md`
- Agent foundation: `.claude/TIER1_AGENT_FOUNDATION.md`
- Session tracking: `.claude/SESSION_PROGRESS.md`
- Model strategy: `.claude/decisions/MODEL_STRATEGY_CLOSED_SI_vs_OPEN_AI.md`

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2025-10-22 | Initial canonical version | Jesse Niesen (CEO) via Liv Hana |

---

**END OF CANONICAL FUNNEL AUTHORITY**

This document is protected from PO1 cleanup and loads at every session startup via `scripts/claude_tier1_boot.sh`.
