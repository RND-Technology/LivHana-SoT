
# ADR-002 — Herbitrage Command Center Dashboard (Enhanced)  

**Status:** Accepted • **Date:** 2025-09-13 • **Owner:** Liv Hana (AI EA)  
**Scope:** Monitoring Dashboard, API tiles, Biz KPIs, Compliance surfaces

## 1) Context

Original `dashboard.json` tracked API latency and a revenue metric but lacked mission views: TPOP funnel, 21+ pass rate, COA compliance flags, HNC pipeline health.

## 2) Decision

Adopt a grid with three columns, mixing system and biz tiles:

1. **Reliability:** API 5xx ratio, p95 latency, error budget burn.
2. **Revenue:** Daily revenue vs target (custom metric), ROI, top channel.
3. **TPOP Funnel:** Views → CTR(OPS) → Policy actions → R&D joins.
4. **Compliance:** Age-gate pass rate, COA red/amber counts.
5. **HNC Pipeline:** Synthesia jobs queued/in-flight/complete; D+1 publish SLA.
6. **Budget:** GCP cost vs budget threshold.

## 3) Implementation

- Base dashboard JSON lives at `docs/monitoring_pack/dashboard.json` (API & revenue tiles).
- Extend with additional tiles once custom metrics are pushed:
  - `custom.googleapis.com/herbitrage/revenue`
  - `custom.googleapis.com/herbitrage/roi`
  - `custom.googleapis.com/herbitrage/tpop_funnel_stage`
  - `custom.googleapis.com/herbitrage/age_gate_pass_rate`
  - `custom.googleapis.com/herbitrage/coa_flags_red` / `..._amber`
  - `custom.googleapis.com/herbitrage/synthesia_pipeline_depth`

**Exporter snippet (Node) to push custom metrics hourly:**

```js
// scripts/push_custom_metrics.js
import {MetricServiceClient} from '@google-cloud/monitoring';
const client = new MetricServiceClient();
const project = process.env.GCP_PROJECT;
async function writeGauge(type, value){
  const dataPoint = {
    interval: {
      endTime: { seconds: Math.floor(Date.now()/1000) }
    },
    value: { doubleValue: value }
  };
  const timeSeriesData = {
    metric: { type },
    resource: { type: 'global', labels: { project_id: project } },
    points: [dataPoint]
  };
  await client.createTimeSeries({ name: client.projectPath(project), timeSeries: [timeSeriesData] });
}
await writeGauge('custom.googleapis.com/herbitrage/age_gate_pass_rate', 0.97);
```

## 4) Testing

- Verify each tile renders and updates within 10 minutes of a metric push.  
- Drill-down links open BigQuery preset queries for ROI and TPOP analysis.

## 5) Security & Compliance

- No PII in metrics. Counts/ratios only.  
- Compliance tile text locked: “21+ • No medical claims • Natural cannabinoids; NIST-validated methods.”

## 6) Acceptance Criteria (SoT Scoring)

- Dashboard deployed and visible to operators.  
- All six tile groups present with live data.  
- BigQuery drill-down links functional.  
**Score:** 100/100 when all tiles draw live data.

## 7) Rollback

- Revert to base `dashboard.json`. Remove custom-metric writers.

<!-- Last verified: 2025-10-02 -->
