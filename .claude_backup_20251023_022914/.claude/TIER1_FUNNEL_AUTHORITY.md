# 🌪️🦄 Liv Hana Tier-1 Unicorn Racing Funnel — AUTHORITY BLUEPRINT

**Load at startup for EVERY Cursor agent. Principle of One enforced. Voice = Sonnet 4.5 OCT 2025 ONLY.**

---

## 🧩 Layer 0: Bootstrap & Invariants (Unicorn Gate)

**Entry**: `./START.sh` → `scripts/claude_tier1_boot.sh`

**Must verify** (abort with remediation on failure):
1. ✅ `node -v` → major >= 20 (`STRICT_NODE_20=true` forces exact v20)
2. ✅ `/opt/homebrew/bin` in PATH top-3; `which claude` → `/opt/homebrew/bin/claude`
3. ✅ `redis-cli PING/SET/GET`
4. ✅ `JWT_SECRET` present OR fetchable via `op run`
5. ✅ Sacred banner at TOP of `tmp/claude_tier1_prompt.txt` (grep verified)
6. ✅ Voice model flag: `--model sonnet-4.5-oct-2025` (abort if missing)

**Outputs**:
- `logs/claude_tier1_boot_YYYYMMDD_HHMMSS.log`
- Append to `.claude/SESSION_PROGRESS.md`

**Auto-Spawn**:
- `scripts/start_research_agent.sh`
- `scripts/agents/voice_orchestrator_watch.sh`

---

## 🎙️🦄 Layer 1.1: Voice Orchestration Core (Sonnet 4.5 OCT 2025 ONLY)

**Model**: 🎙️🤖 Claude Sonnet 4.5 OCT 2025 (voice MCP in `claude-tier1 /voicemode:converse`)

**Role**: Voice ONLY with Jesse. Delegates ALL work to subagents.

**Responsibilities**:
1. Auto-activate voice; greet per banner
2. Capture Jesse directive; confirm; log to `.claude/SESSION_PROGRESS.md`
3. Write `tmp/agent_status/voice.status.json` (`status: listening`)
4. Enforce "silence" protocol: pause TTS, keep mic + session alive
5. Poll `tmp/agent_status/{research,artifact,exec,qa,ops}.status.json` + Redis `agent.events`
6. **FUNNEL GATE**: Only when Research & QA both = `passed` → summarize → request Jesse approval
7. Approval → `voice.status.json = approved`; Rejection → `blocked` (loop to Planning)

### Subagents Living Inside Layer 1.1

| ID | Role | Model & Emoji | Responsibilities |
|-----|------|---------------|------------------|
| **1.1.1** | Planning Subagent | 🧠🤖 ChatGPT-5 High Fast → GPT-5 High | INGEST→FALLACY SCAN→STRATEGIZE→IMPROVE→REFINE→FUSE→HAND OFF<br>Maintains `docs/tier1_recon_plan.md`, `tmp/agent_status/planning.status.json`<br>Read-only codebase; each task = ONE canonical file |
| **1.1.2** | Research Subagent | 🔬🤖 Networked GPT + Perplexity/Apify | Auto-launch: `scripts/start_research_agent.sh`<br>Command: `claude-tier1 research --tools perplexity,apify`<br>Outputs: `docs/fallacy-scan.md`, risk updates, `research.status.json`, `logs/research/*.log` |
| **1.1.3** | QA Subagent | 🛡️🤖 Sonnet 4.5 OCT 2025 text / GPT-4.1 | **Monitors `exec.status.json` - auto-triggers when file changes**<br>Validates ACs, security sweeps, regression tests<br>Writes `logs/qa/*.log`, `qa.status.json`, reports to Planning (1.1.1) |
| **1.1.4** | Artifact+Exec Self-Creation | 🛠️⚡🐆 Claude Code/GPT-4.1 + Cheetah | **CODEX**: applies repo updates, writes `artifact.status.json`<br>**Cheetah**: 8-step runbook (preflight→lint→test→build→docker→slack→voice→exec.status.json)<br>**Immediately signals QA (1.1.3) after writing exec.status** |

---

## 🧠🎙️ Layer 1.2: Cursor Planning Loop

**Model**: 🧠🎙️ Claude Sonnet 4.5 OCT 2025 (planning mode in Cursor)

**Role**: Mirrors PO1 plan work from Layer 1.1.1

**Outputs**:
- `docs/tier1_recon_plan.md` (improved/hardened plans)
- `tmp/agent_status/planning.status.json`

**Coordination**: Two-way loop with Jesse, CEO ↔

---

## 🔬 Layer 2: Research Coordination Loop

**Model**: 🔬🤖 Networked GPT (Perplexity/Apify)

**Role**: Keeps research synchronized (fallacy scan, risk register, evidence ledger)

**Coordination**: Loop with Jesse ↔

---

## 🛠️ Layer 3: CODEX Artifact Pit (External)

**Model**: 🛠️🤖 Claude Code / GPT-4.1

**Role**: Reads `tmp/agent_status/codex_tasks.json`, applies diffs, writes `artifact.status.json`

**Coordination**: Loop with Jesse ↔

---

## ⚡🐆 Layer 4: Execution Lightning (External Cheetah Run)

**Model**: ⚡🐆 Cheetah (Cursor's fastest - likely Gemini-based)

**Role**: Full 8-step runbook when triggered outside Layer 1.1.4

**Critical**: Writes `exec.status.json` → **QA (1.1.3) monitors this file and auto-triggers**

**Coordination**: Loop with Jesse ↔

---

## 🔁 Layer 5: Voice-Orchestrator Watcher

**Script**: `scripts/agents/voice_orchestrator_watch.sh`

**Role**: Waits for `research.status=passed`, `exec.status=passed`, `qa.status=passed`

**Action**: Writes `funnel.ready` → signals Layer 1.1 voice

**Voice Response**: "Research complete, Execution validated, QA passed - proceed?"

**Coordination**: Loop with Jesse ↔

---

## 🔔🚀 Layer 6: Ops/Deployment (HUMAN IN THE LOOP)

**Agent**: 🔔👤 Grasshopper Master CODEX (human)

**Trigger**: `scripts/agents/alert_ops.sh` runs after QA passes

**Alert**: 🔔 **"Ops Ready: Sonnet 4.5 QA passed. Deploy now."**

**Action**: `op run` + deployment script (tunnel, restart, CHANGELOG)

**Status**: `tmp/agent_status/ops.status.json` (`deployed`, `prod`, commit)

**Voice Announces**: "Deployment complete" to Jesse

---

## 🗂️ PO1 FILE SYSTEM (Multi-Agent + Human Coordination)

### Atomic Status Files (Machine-Only)
```
tmp/agent_status/
├── voice.status.json          # Layer 1.1 writes
├── planning.status.json       # Layer 1.1.1 + 1.2 write
├── research.status.json       # Layer 1.1.2 writes
├── artifact.status.json       # Layer 1.1.4 + Layer 3 write
├── exec.status.json           # Layer 1.1.4 + Layer 4 write (QA monitors this!)
├── qa.status.json             # Layer 1.1.3 writes
├── funnel.ready               # Layer 5 watcher writes
├── ops.status.json            # Layer 6 human writes
└── codex_tasks.json           # COORDINATION: Liv Hana → CODEX queue
```

### Append-Only Streams (Rotate at 10MB)
```
.claude/SESSION_PROGRESS.md           # All agents append
logs/claude_tier1_boot_*.log          # One per boot (timestamp)
logs/research/research_agent_*.log    # One per run
logs/qa/qa_agent_*.log                # One per run
logs/ci/*.log                         # Cheetah execution (overwrite)
```

**Rotation Strategy**:
```bash
# When file > 10MB:
mv .claude/SESSION_PROGRESS.md .claude/archive/SESSION_PROGRESS_001.md
touch .claude/SESSION_PROGRESS.md  # New empty
```

### Canonical Docs (CODEX updates, humans read)
```
docs/_index.md                        # MASTER REGISTRY
docs/tier1_recon_plan.md             # PO1 plan (Layer 1.2 improves)
docs/evidence-ledger.md              # File catalog
docs/fallacy-scan.md                 # Research fills
.claude/TIER1_FUNNEL_AUTHORITY.md    # THIS FILE
.claude/decisions/                   # ADRs (never rotate)
```

### Human Editable (Safe)
```
COMMANDER_CODEX_ORDERS.md            # Jesse → CODEX directives
.env.local                           # Local overrides (gitignored)
```

---

## 🛡️ GUARDRAILS (Atomic Operations)

### Atomic Write Pattern
**Script**: `scripts/guards/atomic_write.sh <target> <content>`
```bash
TEMP="$1.tmp.$$"
echo "$2" > "$TEMP"
mv "$TEMP" "$1"  # Atomic rename
```

### File Locking
**Script**: `scripts/guards/with_file_lock.sh <lockfile> <command>`
```bash
exec 200>"$1"
flock -x 200
shift; "$@"
flock -u 200
```

### PO1 Structure Validation (Every Boot)
**Script**: `scripts/guards/validate_po1_structure.sh`
- Check all status files exist
- Create missing from `templates/agent_status/default.json`
- Rotate files > 10MB
- Validate JSON schema
- Abort if corrupted (restore from backup)

### Secret Detection
**Script**: `scripts/guards/check_po1_files.sh`
- Scans for `PERPLEXITY_API_KEY`, `APIFY_TOKEN`, `SLACK_SIGNING_SECRET`, `JWT_SECRET`
- Fails commit if found
- Verifies only `docs/_index.md` files modified

---

## 📊 STATUS SCHEMA

**File**: `docs/agent-contracts.md`

**All status JSON files must have**:
```json
{
  "agent": "voice|planning|research|artifact|exec|qa|ops",
  "phase": "string",
  "status": "listening|running|passed|failed|blocked|approved|deployed",
  "started_at": "ISO8601",
  "finished_at": "ISO8601",
  "artifacts": ["path/to/file"],
  "notes": "string"
}
```

**Validator**: `scripts/agents/validate_status.sh` (CI enforces)

---

## 🦄 ACCEPTANCE CRITERIA (QA Validates)

- [ ] Boot invariants pass; Sonnet 4.5 OCT 2025 enforced
- [ ] Voice banner at TOP of prompt
- [ ] Silence protocol preserved (sacred commits untouched)
- [ ] All status JSON valid schema
- [ ] Research + QA auto-trigger works
- [ ] Voice funnel gating enforced (Jesse approval required)
- [ ] Exec writes status → QA auto-monitors → reports to Planning
- [ ] Preflight/lint/test/build/docker/slack/voice all produce logs
- [ ] PO1 guard blocks secrets, duplicates, unauthorized files
- [ ] Evidence ledger updated (48h sweep)
- [ ] Human ops alert (🔔) triggers on QA pass
- [ ] Voice announces deployment complete

---

## 🔁 THE LOOP (Continuous Unicorn Racing)

```
Jesse Directive (voice) 
  ↓
Layer 1.1: Liv Hana voice captures → dispatches to subagents
  ├→ 1.1.1 Planning → PO1 tasks
  ├→ 1.1.2 Research → citations
  ├→ 1.1.3 QA → monitors exec.status.json
  └→ 1.1.4 Artifact+Exec → creates/runs → writes exec.status
       ↓
QA (1.1.3) AUTO-TRIGGERS (monitors exec.status.json)
  ↓
Planning (1.1.1) receives QA report
  ↓
Voice (1.1) receives Research+QA status
  ↓
Voice announces to Jesse: "Ready to proceed?"
  ↓
Jesse approves via voice
  ↓
Layer 6: Human Ops (🔔 alerted) deploys
  ↓
Voice announces: "Deployment complete"
  ↓
LOOP RESTARTS
```

---

## 📋 MODEL STRATEGY

**File**: `.claude/decisions/MODEL_STRATEGY_CLOSED_SI_vs_OPEN_AI.md`

- **Voice**: 🎙️🤖 Sonnet 4.5 OCT 2025 (Closed SI - Anthropic) - **ENFORCED**
- **Planning**: 🧠🤖 GPT-5 High Fast → GPT-5 High
- **Research**: 🔬🤖 Tool-agnostic (Perplexity, Apify, open fallbacks)
- **Artifact**: 🛠️🤖 Claude Code / GPT-4.1
- **Execution**: ⚡🐆 Cheetah (proprietary - fastest)
- **QA**: 🛡️🤖 Sonnet 4.5 OCT 2025 text / GPT-4.1
- **Ops**: 🔔👤 Human (Grasshopper Master CODEX)

**Substitution**: Forbidden without ADR update + voice gate

---

## 🚨 CRITICAL RULES

1. **Voice stays voice** - Layer 1.1 NEVER types, NEVER clicks - delegates ALL work
2. **QA auto-triggers** - monitors `exec.status.json` - NO SKIPS
3. **Jesse gates ALL** - voice approval required before Ops
4. **One file per purpose** - no duplicates, rotate at 10MB
5. **Atomic writes** - use `atomic_write.sh` + `with_file_lock.sh`
6. **Boot validates** - `validate_po1_structure.sh` runs every startup
7. **Sonnet 4.5 OCT 2025** - ONLY voice model allowed

---

**This is the startup gospel. Load for every agent, every session, no deviations.**

**Unicorn Race Team 🦄 - MOUNT UP!**
