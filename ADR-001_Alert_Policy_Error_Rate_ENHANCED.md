
# ADR-001 — Herbitrage API 5xx Error Policy (Enhanced)  

**Status:** Accepted • **Date:** 2025-09-13 • **Owner:** Liv Hana (AI EA)  
**Scope:** Cloud Run (API), Monitoring, Alerting, Auto-Remediation • **SLO:** p95 < 400ms, 99.9% avail, 5xx < 1%

## 1) Context

Our initial `alert_policy_error_rate.json` detected API 5xx but lacked business alignment, runbook links, and auto-remediation. Observability must tie to mission outcomes (HNC daily publish, OPS policy actions, commerce ROI) and respect 21+ compliance.

## 2) Decision

Adopt a layered alert policy:

- **L1 (Symptom):** 5xx ratio > 1% over 5m on `herbitrage-api` → page on-call.
- **L2 (Cause candidates):** Error spikes with DB timeouts (AlloyDB), quota errors, or invalid tokens (age gate).
- **Biz Impact hook:** When L1 fires, also compute revenue-at-risk for last hour via BigQuery to prioritize.
- **Auto-remediation:** If known transient AlloyDB connection churn is detected, trigger a zero-downtime API revision rollout and restart connection pool.

## 3) Consequences

- Faster MTTR, explicit playbooks, lower false positives.
- Slightly more spend for additional log-based metrics and Cloud Build invocations for rollouts.

## 4) Implementation

**Alert policy (already included in Monitoring Pack):**

- `docs/monitoring_pack/alert_policy_error_rate.json` (threshold 0.01 over 300s).
- Notification channels must be set once (email/SMS/Slack).

**Runbook (this ADR is the runbook entrypoint):**

- Verify Cloud Run revisions health: `gcloud run services describe herbitrage-api --region=us-central1`.
- Check AlloyDB connections: `SELECT NOW();` via Proxy; inspect Pool exhaustion in logs.
- Check Identity token verification failures (age gate blocking valid users).

**Auto-remediation Cloud Build trigger (optional):**

```yaml
# cloudbuild_autoremediation.yaml
steps:
- name: gcr.io/cloud-builders/gcloud
  entrypoint: bash
  args:
    - -lc
    - |
      set -e
      echo "Rolling latest image to new revision for connection refresh"
      gcloud run services update herbitrage-api --region=us-central1 --no-traffic || true
      gcloud run services update-traffic herbitrage-api --region=us-central1 --to-latest
```

Bind a Pub/Sub push from Alerting to a Cloud Function or Cloud Run endpoint that invokes the above Cloud Build with minimal IAM.

## 5) Testing

- Load-test with k6/GCloud: induce 5xx via a guarded test flag; verify alert fires within 5–7 minutes.
- Confirm notification receipt and that auto-remediation rolls a new healthy revision.
- Postmortem template auto-created in `/docs/postmortems/PM-YYYYMMDD.md`.

## 6) Security & Compliance

- No PII in alerts.  
- Maintain 21+ gating: alerts never include tokens or DOB.  
- IAM: least-privilege SA for auto-remediation (`cloudbuild.builds.editor`, `run.admin`).

## 7) Acceptance Criteria (SoT Scoring)

- Alert visible and enabled in Monitoring.  
- Notification channel attached.  
- Runbook link present (this ADR).  
- Synthetic test demonstrates end-to-end page + rollback.  
**Score:** 100/100 once all four checks pass.

## 8) Rollback

- Disable auto-remediation trigger; keep L1 paging.  
- Revert to last known good revision: `gcloud run services update-traffic --to-revisions <rev>=100`.
