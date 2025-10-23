<!-- dd6315fd-e9db-4281-bc27-6509e33c3a8d fec8422b-8765-4057-83e2-e3f2832c3e2c -->
# Authority Startup Blueprint — Embed for All Cursor Agents (Voice, Cursor, CODEX)

Principle‑of‑One enforced; status flows machine‑readable; Claude Sonnet 4.5 OCT gates every phase. This blueprint MUST load at session start for all agents.

0. 🧩 Bootstrap & Invariants
Entry: `./START.sh` → `scripts/claude_tier1_boot.sh`
Must verify (abort with remediation on failure):
- Node major ≥ 20 (`STRICT_NODE_20=true` forces exact v20 when needed)
- `/opt/homebrew/bin` in PATH top‑3; `which claude` ⇒ `/opt/homebrew/bin/claude`
- `redis-cli` PING/SET/GET
- `JWT_SECRET` present or accessible via `op run`
- Sacred voice banner at top of `tmp/claude_tier1_prompt.txt` (grep)
- Sonnet 4.5 OCT enforced — CLI launches with `--model sonnet-4.5`; abort if alias missing
Outputs: `logs/claude_tier1_boot_YYYYMMDD_HHMMSS.log`, append to `.claude/SESSION_PROGRESS.md`
Auto‑spawn:
- `scripts/start_research_agent.sh` (research auto‑launch)
- `scripts/agents/voice_orchestrator_watch.sh` (status watcher)

Layer 1 — 🎙️🦄 Voice Cognition (Sonnet 4.5 OCT ONLY)
- Model: Claude Sonnet 4.5 OCT (voice MCP)
- Auto‑activate, greet per banner
- Capture Jesse directive, confirm, log to `.claude/SESSION_PROGRESS.md`
- Emit `tmp/agent_status/voice.status.json` (status: listening)
- Enforce “silence” → pause TTS; mic/context remain live
- Poll `tmp/agent_status/{research,exec,qa,ops}.status.json` + Redis `agent.events`
- Gatekeeper: only when Research & QA report `status=passed` does voice summarize results and request Jesse’s approval → set `voice.status.json=approved` or `blocked`

Layer 2 — 🧠 RPM Planning Sub‑Agent (ChatGPT‑5 High Fast → GPT‑5 High)
- INGEST → FALLACY SCAN → STRATEGIZE → IMPROVE → REFINE → FUSE → HAND OFF
- Outputs: `docs/tier1_recon_plan.md`, `tmp/agent_status/planning.status.json`
- Scope: read‑only; no commands; each task touches one canonical file

Layer 3 — 🔬 Research (Perplexity/Apify fed)
- Auto‑start via `scripts/start_research_agent.sh` (runs under `op run` to load `PERPLEXITY_API_KEY`, `APIFY_TOKEN`)
- Command: `claude-tier1 research --project LivHana-SoT --plan docs/tier1_recon_plan.md --tools perplexity,apify`
- Helpers: `backend/research-service/src/{perplexity.ts, apify.ts}`; optional MCP servers `tools/perplexity-mcp/`, `tools/apify-mcp/`
- Outputs: `docs/fallacy-scan.md`, risk register updates, `tmp/agent_status/research.status.json`, `logs/research/research_agent_*.log`, optional Redis event

Layer 4 — 🛠️ Artifact Engineering (CODEX: Claude Code / GPT‑4.1)
- Maintain docs: `_index`, evidence ledger, fallacy scan, risk register, research-tools, mobile-control, agent‑orchestration, ADRs
- Maintain scripts: `check_recent.sh`, `guards/check_po1_files.sh`, `claude_voice_session.sh`, `mobile/*.sh`, `start_{research,qa}_agent.sh`, `agents/{emit_event,voice_orchestrator_watch,validate_status}.sh`, `slack_smoke_test.sh`, `docker_env_wrapper.sh`
- Maintain code: Slack bridge (`backend/integration-service/src/slack/*.ts` + tests), Redis consumer (`backend/reasoning-gateway/src/jobs/slack-commands.ts`), MCP scaffolds
- Outputs: clean diffs, verification notes, `tmp/agent_status/artifact.status.json`

Layer 5 — ⚡🐆 Execution (Cheetah Runner)
- Stop instantly on failure; log every command
- `./START.sh` + `bash scripts/claude_tier1_boot.sh --dry-run` → `logs/ci/preflight.log`
- `npm run lint --workspaces` → `logs/ci/lint.log`
- `npm run test --workspaces -- --runInBand` (or unified config) → `logs/ci/test.log`
- `npm run build --workspaces` → `logs/ci/build.log`
- `docker-compose up -d` (Tier‑1 services) + `/health` probes → `logs/ci/docker.log`
- `bash scripts/slack_smoke_test.sh` → `logs/ci/slack_bridge.log`
- `bash scripts/claude_voice_session.sh status` → `logs/ci/voice_cli.log` (Sonnet handshake)
- Write `tmp/agent_status/exec.status.json` and IMMEDIATELY run `scripts/start_qa_agent.sh` (mandatory; QA cannot be skipped)

Layer 6 — 🛡️ QA & Red Team (Liv Hana QA SubAgent)
- Runs inside Liv Hana voice environment after every execution
- Verifies ACs: voice banner, Node/PATH/Redis/JWT, Slack bridge, Redis queue, research‑tool smoke, Tailscale helpers, guard script
- Security sweeps: secret grep, open port audit, regression tests
- Outputs: `logs/qa/qa_agent_*.log`, `tmp/agent_status/qa.status.json`, optional Redis alert

Layer 7 — 🔁 Voice‑Orchestrator Watcher
- `scripts/agents/voice_orchestrator_watch.sh` waits for Research, Execution, QA to report `passed`
- Writes `tmp/agent_status/funnel.ready`; signals voice agent
- Voice agent announces readiness; Jesse approves via voice; `voice.status.json` updated

Layer 8 — 🚀 Ops / Deployment (HUMAN‑IN‑THE‑LOOP)
- Actor: Grasshopper (Ops human) or CI operator
- Path: `op run` with production secrets → deployment script (Cloudflare/Tailscale tunnel, service restart, `CHANGELOG.md` update)
- Status: `tmp/agent_status/ops.status.json` (status, environment, commit); logs under `logs/ops/*`
- Alert: 🔔 Notify Grasshopper Master CODEX on deploy ready/complete; voice agent announces outcome to Jesse

Telemetry & Guardrails
- Status schema: `docs/agent-contracts.md` (agent, phase, status, started_at, finished_at, artifacts, notes) → validated by `scripts/agents/validate_status.sh`
- PO1 guard: `scripts/guards/check_po1_files.sh` ensures only registered docs change; fails on `PERPLEXITY_API_KEY|APIFY_TOKEN|SLACK_SIGNING_SECRET|

### To-dos

- [ ] Create ADR documenting Sonnet 4.5 OCT as voice model
- [ ] Enforce voice model flag in boot/session scripts
- [ ] Define agent status JSON contract doc
- [ ] Create emit_event.sh to write status and publish events
- [ ] Add orchestrator watcher to gate on Research+QA
- [ ] Have Execution write exec.status and auto-trigger QA
- [ ] Update docs/agent-orchestration with model + wiring