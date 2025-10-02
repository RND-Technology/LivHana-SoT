# ADR-002 — Herbitrage Command Center Dashboard (Tier 1)

Status: Accepted  
Version: 1.0  
Date: 2025-09-28  
Owner: Liv Hana (AI EA)  
Approver: Jesse (CEO)  
Supersedes: (None)  
Related: END_TO_END_MISSION_TIER1.md, SYSTEM_PROMPT.md, SNAPSHOT_SPEC.md

## 1. Context

The existing monitoring view (legacy `dashboard.json`) surfaced only basic API latency and a coarse “revenue” gauge. It failed to support:

- Unified E2E situational awareness (business + compliance + orchestration).
- Rapid drill‑down for revenue levers, model routing health, and compliance posture.
- “1–2 click” cockpit mission requirement (every critical domain reachable instantly).
- Standardized metric taxonomy (naming, type, units, update cadence).
- Proactive anomaly detection (error budget burn, synthetic pipeline depth).
- Multi-agent (browser / DoBrowser / Comet+ style) operational overlay readiness.

## 2. Problem Statement

Operators lack an authoritative, composable, low-latency dashboard tying:

1. Reliability (SLO adherence)  
2. Revenue & funnel economics  
3. Compliance (21+ / COA)  
4. Creative / Content pipeline (HNC) progress  
5. Orchestration & model routing health  
6. Cloud spend vs budget

Absence leads to: slower incident triage, opaque compliance risk, slower iteration loops, and inability to track Verified Critical Workflow Coverage (VCWC) impact.

## 3. Forces & Constraints

| Force | Description | Design Response |
|-------|-------------|-----------------|
| Low latency situational awareness | Decisions require near-real metrics (<5m) | Use Cloud Monitoring custom metrics (1–5m TTL push) |
| Mixed domains (biz + tech + compliance) | Fragmented sources (API logs, BigQuery, agents) | Normalized metric naming convention + ingestion layer |
| Avoid PII | Regulatory & 21+ environment | Ratios / counts only; no raw user identifiers |
| Cost control | Avoid runaway custom metric cost | Batch writes; targeted cardinality (env + stage only) |
| Extensibility | New tiles without redesign | Declarative `dashboard.spec.yaml` with schema |
| Deterministic verification | “Verification over generation” | Add `check_dashboard_metrics.sh` (presence & freshness) |

## 4. Decision

Implement a three-column adaptive grid dashboard (“Command Center”) anchored in the Cockpit, with foundational metric taxonomy and automated ingestion pipeline.

### 4.1 Canonical Tile Groups (Initial Set)

| Group | Tiles | Rationale |
|-------|-------|-----------|
| Reliability | API p95 latency, 5xx ratio, error budget burn, uptime | SLO adherence & early degradation detection |
| Revenue | Daily gross (proxy), Revenue vs Target %, Top Channel, ROI | Business viability & growth levers |
| Funnel (TPOP) | STAGE_1->…->STAGE_N conversion rates | Visibility into attention → transaction path |
| Compliance | Age Gate Pass %, COA flags (red/amber), Policy Violations | 21+ integrity & regulatory shield |
| HNC Pipeline | Jobs queued / running / success, D+1 publish SLA | Content & creative velocity |
| Orchestration | Router p95, Success Rate, Fallback Rate | Multi‑model reliability & routing quality |
| Budget / Cost | Daily spend vs budget, 7d forecast | Prevent silent cost creep |

> NOTE: “TPOP” acronym currently UNDEFINED in source inputs. Assumed to be a multi-stage funnel (e.g., Traffic → Product → Offer → Purchase). See Section 14.

### 4.2 Tile Priority Levels

- P0: Reliability, Compliance, Orchestration (guardrails & uptime).
- P1: Revenue, Funnel, Cost (business execution).
- P2: Creative Pipeline (velocity amplifier).
Full acceptance = all P0 + P1 with live data; P2 can stage in waves.

## 5. Architecture Overview

```
[Sources] --> [Metric Collectors] --> [Aggregation + Normalization] --> [Push Layer] --> [Cloud Monitoring / BigQuery] --> [Dashboard Renderer + Cockpit Embeds]
                      |                                                     |
           (Cron / sched_high_noon / agents)                         Snapshot Export (docs/snapshots)
```

### Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| Collectors (Node/Python) | `automation/metrics/` | Poll APIs, derive ratios |
| Metric Push Script | `automation/metrics/push_metrics.js` | Batch write gauges |
| Orchestration State | `automation/swarm/runtime_state.json` | Provide router perf stats |
| Dashboard Spec | `docs/monitoring_pack/dashboard.spec.yaml` | Declarative tile config |
| Renderer | Cockpit React module `frontend/vibe-cockpit/modules/command-center/` | Layout + drill-down links |
| Verification | `automation/scripts/check_dashboard_metrics.sh` | Structural & freshness validation |

## 6. Metric Taxonomy

| Metric Name | Type | Unit | Source | Interval | Cardinality | Notes |
|-------------|------|------|--------|----------|-------------|-------|
| `custom.googleapis.com/herbitrage/api_p95_latency_ms` | Gauge | ms | API gateway logs | 1m | env | Rolling window |
| `.../api_5xx_ratio` | Gauge | % (0–1) | Log derived | 1m | env | Burn trigger |
| `.../error_budget_burn_1h` | Gauge | % | SLO calc | 5m | env | SLO integration |
| `.../daily_revenue_proxy` | Gauge | USD | Consolidated events (BigQuery) | 5m | env | Privacy-safe proxy |
| `.../revenue_vs_target_pct` | Gauge | % | Derived (target config) | 5m | env | target file `config/revenue_targets.json` |
| `.../funnel_stage{stage=n}` | Gauge | count | Events table | 5m | stage,env | Low stage label cardinality |
| `.../funnel_conv_rate{from,to}` | Gauge | % | Derived adjacency | 5m | pair,env | Keep adjacency pairs fixed |
| `.../age_gate_pass_rate` | Gauge | % | Frontend log events | 5m | env | Must match age gate check |
| `.../coa_flags_red` | Gauge | count | COA scan | 10m | env | Should trend to 0 |
| `.../coa_flags_amber` | Gauge | count | COA scan | 10m | env | Pre-fail signal |
| `.../hnc_jobs_queued` | Gauge | count | Pipeline queue | 1m | env | |
| `.../hnc_publish_sla_breach` | Gauge | count | SLA monitor | 5m | env | Count > 0 = incident |
| `.../router_p95_latency_ms` | Gauge | ms | runtime_state.json | 1m | env | Populated by High Noon + real routes |
| `.../router_success_rate` | Gauge | % | runtime_state.json | 1m | env | |
| `.../router_fallback_rate` | Gauge | % | runtime_state.json | 1m | env | |
| `.../gcp_cost_daily_usd` | Gauge | USD | Billing export (BQ) | 1h | env | |
| `.../gcp_cost_budget_pct` | Gauge | % | Derived (target config) | 1h | env | |

## 7. Implementation Plan (Phased)

| Phase | Goal | Scope | Acceptance |
|-------|------|-------|------------|
| 0 Foundation | Spec + baseline tiles | Spec file + reliability metrics only | Dashboard loads w/ p95 + 5xx |
| 1 Orchestration | Router health tile group | Add runtime metrics + fallback | p95 + success + fallback visible |
| 2 Compliance | Age Gate + COA metrics | Add scanners + push | Age gate % stable; COA counts 0/low |
| 3 Revenue & Funnel | Revenue proxy + stages 1–N | Funnel mapping doc + metrics | All stage counts + conv rates |
| 4 Creative / HNC | Pipeline depth + SLA | Job state ingestor | Depth chart & breach counter |
| 5 Cost Control | GCP cost + budget delta | Billing export + config | Daily cost & % of budget |
| 6 Hardening | Anomaly thresholds + alerts | Alert rules & runbooks | Alerts fire correctly |

## 8. Verification Strategy

| Script / Check | Purpose | Fail Condition |
|----------------|---------|----------------|
| `check_dashboard_metrics.sh` | Presence + last_write_age | Missing metric or stale >10m (P0) |
| `check_router_health.sh` | Already implemented | p95 / failures exceed limits |
| `check_age_gate.sh` | Alignment: gating UI sentinel present | Sentinel missing |
| `check_memory_snapshot.sh` | Snapshot includes key aggregates | Fields absent |
| Synthetic Push Test | Write dummy value → confirm ingestion | No ingestion in 5m |

Snapshot extension: append `dashboard` object summarizing P0 tiles for historical trending.

## 9. Security & Compliance

- Only aggregate / ratio metrics—no raw user IDs.
- Age gate & COA metrics are counts, not event logs.
- Revenue “proxy” must derive from anonymized aggregated table (NOT raw transaction IDs).
- Minimum retention for sensitive derived cost metrics in BigQuery: 180 days; snapshots store only “yesterday” aggregate.
- Dashboard text for compliance tile (immutable string):  
  `21+ Verified • No Medical Claims • Natural Cannabinoids • NIST-Validated Methods`

## 10. Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Single mixed JSON file without taxonomy doc | Hard to extend & govern |
| Direct DB queries in dashboard frontend | Latency + credentials risk |
| Grafana instead of Cloud Monitoring | Additional hosting complexity; GCP native integration needed |
| Push everything to BigQuery then derive in UI | Increased query cost & real-time lag |

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Metric drift / rename breaks tiles | Missing visibility | Versioned taxonomy; contract test in `check_dashboard_metrics.sh` |
| Cost explosion (high cardinality) | Budget pressure | Strict label whitelist; periodic metric usage audit |
| Funnel ambiguity (“TPOP” undefined) | Misleading decisions | Clarify acronym and stage definitions (Section 14) |
| Synthetic metrics left in prod | Polluted data | Tag synthetic w/ `env=staging` only; PR review gating |
| Router metrics under-report early | False confidence | Display “insufficient sample” banner when < N runs |

## 12. Rollback Plan

1. Disable custom metric push jobs.
2. Revert `dashboard.spec.yaml` to Phase 0 baseline.
3. Remove dashboard embed component if causing cockpit failures.
4. Keep historical snapshots (no purge).
5. Open ADR amendment if rollback > 48h.

## 13. Acceptance Criteria (Final Tier 1)

| Criterion | Measure |
|----------|---------|
| All P0 & P1 metrics live | Metrics list non-stale (≤2 collection intervals) |
| Dashboard load time | < 2s initial render (cached) |
| Compliance tile continuously green | Age Gate % > configured floor (e.g. 0.95) |
| Router fallback rate | < 10% steady-state |
| VCWC linkage | Each metric mapped to at least one workflow in `NSM_matrix.md` |
| Verification passing | All related `check_*` scripts green in CI |

## 14. Unresolved / Requires Clarification

| Item | Needed |
|------|--------|
| “TPOP” exact stage definitions | Provide enumeration & semantic meaning |
| Revenue proxy formula | Explicit fields & transformation logic |
| Budget threshold governance | Where is budget config stored? (`config/budget.json` proposed) |
| HNC pipeline provider specifics | Final source for job states (Synthesia vs internal) |

## 15. Follow-Up Tasks

- [ ] Create `docs/monitoring_pack/dashboard.spec.yaml`
- [ ] Implement `automation/scripts/check_dashboard_metrics.sh`
- [ ] Draft Funnel stage spec `docs/missions/FUNNEL_TPOP_SPEC.md`
- [ ] Add snapshot enrichment hook
- [ ] Add Phase 1–3 ADR references when implemented

## 16. Appendix: Sample dashboard.spec.yaml (Excerpt)

```yaml
version: 1
layout:
  columns: 3
tiles:
  - id: api_latency
    group: reliability
    metric: custom.googleapis.com/herbitrage/api_p95_latency_ms
    type: timeseries
    thresholds:
      warn: 600
      crit: 900
  - id: router_success
    group: orchestration
    metric: custom.googleapis.com/herbitrage/router_success_rate
    type: gauge
    invert: false
  - id: age_gate
    group: compliance
    metric: custom.googleapis.com/herbitrage/age_gate_pass_rate
    type: gauge
    thresholds:
      warn: 0.94
      crit: 0.90
```

---

<!-- Last verified: 2025-10-02 -->
