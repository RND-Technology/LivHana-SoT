<!--
Optimized: 2025-10-03
RPM: 3.6.0.6.ops-technology-ship-status-documentation
Session: Dual-AI Collaboration - Sonnet Docs Sweep
-->
# NSM Matrix – Critical Workflow Coverage

> Track 25 Tier‑1 workflows. Columns: Defined (Y/N), Verified (Y/N), Automated Test (Y/N), Owner.

| Workflow ID | Defined | Verified | Automated Test | Owner | Notes |
|-------------|---------|----------|----------------|-------|-------|
| voice-session-enqueue | Y | Y | Y | Liv | Voice panel → queue → SSE |
| voice-session-playback | Y | N | N | Liv | ElevenLabs playback guarded by JWT |
| reasoning-guardrail | Y | Y | Y | Liv | Guardrail filter before DeepSeek |
| reasoning-memory-store | Y | Y | N | Liv | Snapshot of job history |
| reasoning-feedback-log | Y | Y | N | Liv | Feedback append hook |
| router-fallback | Y | N | N | Liv | Force fallback scenario check |
| router-latency-sla | Y | N | N | Liv | p95 < 700ms monitoring |
| snapshot-generation | Y | N | N | Liv | `generate_snapshot.py` orchestration |
| snapshot-verification | Y | N | N | Liv | `check_memory_snapshot.sh` |
| dashboard-metric-health | Y | N | N | Liv | `check_dashboard_metrics.sh` pending |
| age-gate-enforcement | Y | N | N | Liv | `check_age_gate.sh` |
| coa-scan | Y | N | N | Liv | COA flag metrics |
| workflow-inventory-refresh | Y | N | N | Liv | Manifest checker |
| scorecard-daily-generation | Y | N | N | Liv | Daily markdown summary |
| risklog-weekly-review | Y | N | N | Liv | T-30 cadence |
| cost-budget-drift | Y | N | N | Liv | Budget vs spend |
| payment-gateway-heartbeat | Y | N | N | Liv | KAJA/Authorize.Net ping |
| compliance-webhook-hardening | Y | N | N | Liv | Webhook auth guard |
| agent-router-decision | Y | N | N | Liv | Multi-agent overlay contract |
| tpop-stage-tracking | N | N | N | Liv | Finalize stage spec |
| hnc-pipeline-sla | Y | N | N | Liv | Content pipeline depth |
| cloud-plan-drift-check | Y | N | N | Liv | `check_infra_plan.sh` |
| secrets-audit | Y | N | N | Jesse | Vault parity / op sync |
| profit-optimizer-loop | N | N | N | Liv | ROI algorithm verification |
| cannabis-compliance-audit | Y | N | N | Jesse | THC % + license validation |

## Update Procedure

1. Set `Defined=Y` when doc/spec + acceptance criteria exist.
2. Flip `Verified=Y` once a script/test enforces the workflow.
3. `Automated Test=Y` when integrated into CI with deterministic mocks.
4. Assign Owner (single accountable persona).
5. Update notes with script references or ADR links.

## Coverage Formula

`Coverage % = (Verified rows) / 25 * 100`

Record coverage deltas in SCORE-daily / weekly reports.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
