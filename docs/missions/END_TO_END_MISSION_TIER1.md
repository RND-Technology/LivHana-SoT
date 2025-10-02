# End‑to‑End Mission – LivHana-SoT (Tier 1 Spec v1.0)

Version: 1.0  
Status: ACTIVE  
Owner: Jesse (CEO – Final Authority)  
Steward: Liv Hana (Autonomous Assistant)  
Updated: YYYY-MM-DD (set on commit)

---

## 1. Executive Summary

LivHana-SoT is the authoritative Single Source of Truth (SSoT) unifying architecture, code, verification, and operating doctrine for the Liv Hana AI cockpit ecosystem.  
Objective: Deliver a cloud-native, multi‑model (GPT / Claude / Gemini / DeepSeek) orchestration platform powering a React/Tailwind cockpit + FastAPI (service layer) + automation & compliance pipelines, with truth-first memory and verification-first development.

---

## 2. Mission Statement

Build and continuously improve an autonomous, auditable AI operations cockpit that converts raw intent (Jesse / operator commands) into verifiable, value-producing workflows (revenue, compliance certainty, creative output) with minimal human friction.

---

## 3. North Star (Primary Metric)

**Verified Critical Workflow Coverage (VCWC)**  
Definition: % of the top 25 revenue/compliance–critical workflows that are:
`codified + versioned + has passing check_* script + monitored + auto-healing path + documented (docs/)`.

| Quarter | Target VCWC | Supporting OKRs |
|---------|-------------|-----------------|
| Q0 (Baseline) | Inventory established | List + owners |
| Q1 | 40% | 10+ verification scripts |
| Q2 | 65% | MTTR < 20m |
| Q3 | 85% | No critical regressions |
| Q4 | 95% | Automated failover for Tier 1 flows |

Supporting Metrics:

- Mean Verification Latency (PR open → all required checks pass) < 15m
- Snapshot Freshness: < 26h
- Orchestration p95 Decision Latency < 500ms
- Deployment Success Rate > 98%
- Compliance Drift Incidents = 0

---

## 4. Strategic Pillars

| Pillar | Intent | Measure |
|--------|--------|---------|
| Sovereign Knowledge | No hidden state; SSoT or reject | Shadow logic incidents = 0 |
| Verification First | Generate only after structure & checks | New features accompanied by ≥1 new/extended check_* |
| Multi-Model Orchestration | Dynamic model routing by cost, latency, capability | Router success (fallback hit rate <10%) |
| Compliance & 21+ Integrity | Age gate & COA never regress | Gating check script always green |
| Revenue Engine Stability | No deployment harms conversion | Δ conversion during deploy < ±3% |
| Observability & Recovery | Detect & repair before user impact | MTTR & detection time trend down |
| Creative Velocity | Concept → usable asset rapidly | Median “idea → first asset” < 24h |

---

## 5. Scope

### In-Scope

- Cockpit frontend (`frontend/vibe-cockpit`)
- API & orchestrator (FastAPI + Python modules under `backend/`)
- Multi-model agent routing (GPT / Claude / Gemini / DeepSeek)
- Compliance automation (21+, COA presence audit)
- Memory snapshots + historical intelligence
- Build / Test / Deploy (CI/CD GitHub Actions)
- Structured verification scripts (`automation/scripts/check_*.sh`)
- Infra manifests (Cloud Run / Terraform) under `infra/`

### Out-of-Scope (Phase 1)

- Full billing engine (stub metrics only)
- External marketplace integration
- Advanced LLM fine-tuning pipeline
- Real-time streaming avatar engine (placeholder hooks only)

---

## 6. Repository Structure (Canonical)

```
LivHana-SoT/
  frontend/          # React/Tailwind surfaces (vibe-cockpit, future dashboards)
  backend/           # FastAPI services, orchestrator modules, adapters
  automation/
    scripts/         # check_* & utility scripts (verification-first)
    schedulers/      # timed snapshot / cadence tasks
    swarm/           # orchestration configs, model routing tables
    data-pipelines/  # ingestion + transformation stubs
  infra/
    terraform/       # (if adopted) IaC
    cloud-run/       # service definitions
  docs/
    adr/             # ADR-### files
    playbooks/       # RUN-* operational playbooks
    missions/        # Mission briefs (this file)
    scorecards/      # SCORE-daily / weekly / monthly
    governance/      # RISKLOG, CONTRIBUTING, SECURITY
    snapshots/       # Generated JSON state
  legacy/            # Archived artifacts (read-only)
```

Enforced by structure check script (`check_trinity_status.sh` or successor).

---

## 7. Multi-Model Orchestration (Tier 1 Design)

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Input Normalizer | request_adapter.py | Convert cockpit intent → canonical task spec |
| Router | router.py | Select model (cost + latency + capability weights) |
| Execution Node | providers/*.py | Vendor-specific adapters (OpenAI / Anthropic / Google / DeepSeek) |
| Fallback Manager | fallback.py | Retry with downgraded model chain |
| Post Processor | postprocess.py | Sanitize, extract structured payload |
| Verifier | verifier.py | Optional: schema validation / hallucination guard |
| Audit Logger | audit.py | Append execution metadata to snapshot buffer |

**Routing Heuristic (Baseline v1):**  
Score(model) = (W_latency *normalized_latency_ms) + (W_cost* normalized_cost) + (W_capability * capability_rank) – penalize recent failures.  
Pick lowest. Maintain sliding window stats in `automation/swarm/runtime_state.json`.

Fallback Ladder Example:

1. GPT-4.1 / Claude Sonnet (primary)
2. DeepSeek 33B local (cost-optimized)
3. Gemini Flash (latency shot)
4. Static template (extreme failure mode)

---

## 8. Memory & Snapshot Architecture

| Artifact | Format | Frequency | Purpose |
|----------|--------|----------|---------|
| snapshot_YYYY-MM-DD_HHMMZ.json | JSON | Daily + on-demand | Historical operational state |
| SCORE-daily*.md | Markdown | Daily | Human-readable summary |
| NSM_matrix.md | Markdown | Weekly update | Workflow coverage tracking |
| audit.log (rolling) | NDJSON | Continuous | Raw orchestration events (external storage) |
| RISKLOG.md | Markdown | Weekly | Risk governance |

Snapshot Schema (abbrev):

```jsonc
{
  "version": "1.0",
  "timestamp_utc": "...",
  "orchestration": { "runs_ok": 0, "runs_fail": 0, "p95_ms": 0 },
  "models": { "gpt": {...}, "claude": {...}, "gemini": {...}, "deepseek": {...} },
  "revenue_proxy": { "checkout_success_rate": 0.0 },
  "compliance": { "age_gate_pass": true, "coa_pass": true },
  "workflow_coverage": { "defined": 0, "verified": 0, "target": 25 },
  "infra": { "drift": false },
  "risk_flags": ["R1","R2"]
}
```

Scripts:

- `check_memory_snapshot.sh`
- `sched_snapshot.sh`
- `generate_snapshot.py` (if Python variant required)

---

## 9. Verification & Quality Gates

| Gate | Enforced By | Fails If |
|------|-------------|----------|
| Structure | `check_structure.sh` | Missing critical dirs/files |
| Age Gate | `check_age_gate.sh` | Frontend gating markers absent |
| Router Health | `check_router_health.sh` | Consecutive fails > 1 or p95 > threshold |
| Snapshot Freshness | `check_memory_snapshot.sh` | Age > 26h |
| Workflow Inventory | `check_workflow_inventory.sh` | Undefined owner / missing manifest |
| Lint / Types | ESLint / mypy (future) | Errors present |
| Security | `check_secrets_scan.sh` | Plaintext secret patterns found |
| Infra Drift | `check_infra_plan.sh` | Non-empty plan diff (unapproved) |

**Rule:** Every new capability adds or extends at least one verification script.

---

## 10. Operational Cadence

| Cadence | Activity | Output |
|---------|----------|--------|
| Per PR | Full verification suite | CI status |
| Daily 00:05Z | Snapshot + Scorecard | JSON + SCORE-daily |
| High Noon | Orchestration stress run | log diff |
| Weekly (T-30) | Risk + Coverage review | RISKLOG update / NSM_matrix |
| Monthly | Trend consolidation | SCORE-monthly |
| Quarterly | Architecture refactor audit | ADR delta summary |

---

## 11. Environments

| Env | Purpose | Deploy Mechanism | Data |
|-----|---------|------------------|------|
| Local | Dev / rapid iteration | `npm run dev` / `uvicorn` | Mock / safe |
| Staging | Pre-production verification | GitHub Action (push → main) | Sanitized mirrors |
| Production | Live operations | Manual approval gate | Real-time (restricted) |

Promotion Path: feature branch → PR (checks pass) → merge main → staging auto → manual approval → production.

---

## 12. Security & Compliance

| Control | Mechanism |
|---------|-----------|
| 21+ Gating | Frontend component + test scanning for `<AgeGate />` sentinel |
| COA Integrity | Future: COA manifest JSON + validator |
| Secrets | .env references only; commit hook to reject `.env` leakage |
| Logging PII | Redaction layer in `postprocess.py` |
| Model Data Boundary | No raw user PII to external LLM unless masked |
| Access Segregation | Scripts in automation must not mutate outside SoT path without explicit flag |

---

## 13. Observability

| Layer | Tool / Plan |
|-------|-------------|
| App Logs | Structured JSON (stdout → Cloud Logging) |
| Metrics | Basic counters (requests, errors, latency) – future: OpenTelemetry |
| Router Stats | Rolling window JSON + optional Prometheus |
| Alerts | GitHub Action + Slack/Email (fail on 2 consecutive critical scripts) |
| Snapshot Diff | `diff_last_snapshot.sh` textual delta |

---

## 14. Risk Register (Summary)

| ID | Category | Description | Likelihood | Impact | Status | Mitigation |
|----|----------|-------------|-----------|--------|--------|-----------|
| R1 | Orchestration | Router not live | M | H | Open | Build baseline router |
| R2 | Memory | Snapshot cadence undefined | M | M | Open | Implement SNAPSHOT_SPEC + scripts |
| R3 | Compliance | Automated age gate scan missing | L | H | Open | Implement check_age_gate.sh |
| R4 | Coverage | Workflow inventory incomplete | M | M | Open | Implement inventory script |
| R5 | Infra | Drift detection not automated | L | M | Watch | Add plan check in CI |

Full detail: `docs/governance/RISKLOG.md`.

---

## 15. Success Metrics

| Metric | Baseline | Target (Next 30d) | Method |
|--------|----------|-------------------|--------|
| VCWC | TBD | 20% | Inventory + script |
| New check_* scripts | 0 | 5 | CI enumerator |
| Snapshot Freshness SLA | N/A | 100% <26h | check_memory_snapshot |
| Router p95 (ms) | N/A | <700ms initial | router stats |
| Age Gate Integrity | Manual | 100% automated | check_age_gate |
| Orchestration Success Rate | 0% | >90% | router log |

---

## 16. MVP Backlog (Waves)

### Wave 0 (Foundation – Days 1–5)

| Item | Type | Owner | Exit Criteria |
|------|------|-------|---------------|
| Baseline router (round-robin + cost weight) | Orchestration | Dev | `router.py` + health script green |
| Snapshot generator + spec | Memory | Automation | First JSON snapshot present |
| Age gate scan script | Compliance | Automation | CI fails if tag missing |
| Structure + workflow inventory scripts | Verification | Automation | Reports in CI |
| SCORE-daily template integration | Reporting | Docs | First SCORE-daily committed |

### Wave 1 (Stabilization – Days 6–14)

| Item | Type | Exit Criteria |
|------|------|---------------|
| p95 latency metric capture | Orchestration | Stats persisted |
| Fallback ladder implementation | Orchestration | Failure test passes |
| Infra drift plan check | Infra | CI shows PASS/FAIL |
| NSM_matrix.md established | Coverage | Matrix file with 25 rows |
| RISKLOG weekly automation | Governance | Updated timestamp automatically |

### Wave 2 (Acceleration – Days 15–30)

| Item | Type | Exit Criteria |
|------|------|---------------|
| Cost-aware routing weights | Optimization | Cost column populated |
| Model capability tagging | Routing | Table in docs/models.md |
| Workflow-driven scaling triggers | Ops | Simulated load test passes |
| COA placeholder validator | Compliance | Stub script PASS |
| OpenTelemetry scaffold | Observability | Basic trace exported |

---

## 17. Definition of Done (DoD)

A task is *done* only if:

1. Code / script exists & passes lint
2. Added/updated docs (or declared N/A in PR)
3. At least one verification script added/expanded
4. Risk log considered (new entry or none needed)
5. CI all green (structure + verification)
6. If workflow-affecting: included in VCWC matrix

---

## 18. Contribution Workflow

1. Open issue (label: `feat`, `verification`, `infra`, `risk`)  
2. Branch naming: `feat/<slug>` or `verify/<script-name>`  
3. Implement + add/modify `check_*` if applicable  
4. PR template auto-includes: INTENT / CHANGES / NEW SCRIPTS / RISK / COVERAGE IMPACT  
5. Merge requires all checks green + 1 human review (Jesse or delegated)  
6. Staging deploy auto → snapshot → optional promote to production

---

## 19. Open Questions

| Question | Owner | Resolution Target |
|----------|-------|-------------------|
| Use Terraform vs pure Cloud Run YAML? | Infra | Wave 1 decision |
| Store audit logs external (GCS / S3)? | Automation | Wave 1 |
| Adopt Redis for router state? | Orchestration | Wave 2 |
| Introduce message schema contract (Protobuf vs JSON)? | Backend | Wave 2 |

---

## 20. Next 7-Day Action Plan

| Day Range | Action | Artifact |
|-----------|--------|----------|
| 1–2 | Router baseline + structure / inventory scripts | `backend/router.py`, `automation/scripts/check_workflow_inventory.sh` |
| 2–3 | Snapshot generator + SCORE-daily start | `automation/scripts/generate_snapshot.py` |
| 3–4 | Age gate scanner + compliance guard | `automation/scripts/check_age_gate.sh` |
| 4–5 | RISKLOG + NSM_matrix initial commit | `docs/scorecards/NSM_matrix.md` |
| 5–7 | Fallback ladder + latency metrics | `backend/router_fallback.py` |
| 7 | First weekly review | `SCORE-weekly-YYYY-MM-DD.md` |

---

## 21. Immediate Script Stubs (To Create)

| Script | Purpose |
|--------|---------|
| `check_workflow_inventory.sh` | Validate presence of workflow manifest + owners |
| `check_age_gate.sh` | Ensure age gating component present in frontend |
| `check_memory_snapshot.sh` | Snapshot freshness + schema compliance |
| `check_router_health.sh` | p95 latency + failure rate constraints |
| `check_infra_plan.sh` | Detect infra drift (terraform plan or diff) |

---

## 22. Promotion & Archival Policy

- Any prototype promoted → add ADR if structural
- Decommission leaves stub pointer for 30 days in original path
- Legacy subtree is READ-ONLY; PRs modifying it fail CI unless label `legacy-update` + justification

---

## 23. Response Template (For Non-Trivial Future Requests)

```
INTENT: <summary>
STATE: <relevant components / metrics>
GAPS: <explicit missing artifacts>
PLAN:
  1) …
  2) …
  3) …
VERIFICATION: <scripts to add/extend>
RISK: <impact or “none”>
ETA: <time or cycle>
```

---

## 24. Compliance Markers (21+ / COA)

- Frontend gating sentinel: `<AgeGatePortal />` or data-test attribute `data-age-gate="active"`
- COA placeholder file: `docs/compliance/COA_MANIFEST.md`
- Scanner enumerates gating components & fails if missing from any purchase / restricted route.

---

## 25. Appendix – Minimal Router Pseudocode

```python
def route(task):
    models = load_model_stats()
    scored = []
    for m in models:
        score = (
            W_LAT * norm(m.latency_ms) +
            W_COST * norm(m.cost_per_1k) +
            W_CAP * (1 - m.capability_rank_norm) +
            W_FAIL * recent_failure_penalty(m)
        )
        scored.append((score, m))
    best = sorted(scored, key=lambda x: x[0])[0][1]
    try:
        return best.invoke(task)
    except Exception:
        return fallback_chain(task)
```

---

**END OF SPEC**

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->
