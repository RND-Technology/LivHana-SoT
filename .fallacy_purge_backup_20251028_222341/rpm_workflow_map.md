# RPM Workflow Map – Do_LivHana_RPM_Workflow (MVP v0.1)

## 1. Overview
- Purpose: Explain how the ingestion workflow fits into the Liv Hana Master Workflow.
- Scope: Streams ingested, guardrails, retry logic, logging, KPI calculation.
- Diagram: [ASCII/mermaid diagram showing node flow].

## 2. Node Definitions
| Node Name         | Type         | Purpose summary                                      | Inputs                       | Outputs                    |
|-------------------|--------------|------------------------------------------------------|------------------------------|----------------------------|
| Start             | Trigger      | Entry point                                           | —                            | flow_start_event           |
| Guardrail         | Validation   | Validate sources presence, age‑gate, PII redaction   | raw_source_streams           | validated_sources / fail   |
| While (RetryLoop) | Loop         | Ingest each stream with retry logic                   | validated_sources            | ingest_success/fail        |
| Transform         | Data         | Compress/truncate records, ensure token hygiene      | raw_ingest_records           | processed_records          |
| Logging/Tracing   | Audit        | Emit structured logs, record metrics, audit trail    | processed_records, meta_info | log_entries                |
| KPI_Calculator    | Analytics    | Compute records processed, time saved, token cost    | log_entries                  | kpi_report.json            |
| Set_State         | State update | Update workflow status (green/yellow/red)            | kpi_report                  | workflow_status            |
| End               | Terminate    | Final node                                             | workflow_status              | —                          |

## 3. Data Flow & Parallelisation
- Streams: LightspeedPOS, SquareRefunds, VeriffEvents, COA_Results, 3PL_Routes.
- Parallel ingestion: Streams pulled in parallel where safe (non‑blocking).
- Retry logic: Up to 2 attempts per stream; if still fails → escalate human path.
- Logging: Each stream publishes JSON lines to `/gold/ingest/YYYY‑MM‑DD/streams/{source}/`.
- Audit trail: `/gold/logs/YYYY‑MM‑DD/runtime.log.json`.

## 4. Compliance & Guardrails
- Age ≥ 21 filter applied in Guardrail node.
- PII redaction: Normalize names (lowercase, trim, collapse punct.), then HMAC‑SHA256 with `${HASH_KEY}`; Raw PII never stored.
- No medical claims in text; Texas policy feed priority.
- Data retention policy: Snapshots stored for 365 days, logs retained 730 days.

## 5. Metrics & KPIs
- Records processed per stream.
- Retry count per stream.
- Token usage (model invocation).
- Latency per stream and total workflow.
- Estimated time saved (manual vs automated).
- Projected upstream revenue impact.

## 6. Version & Rollback Strategy
- Branch naming: `feature/rpm‑mvp‑2025‑10‑26`.
- Tag at publish: `v0.1‑mvp`.
- Changelog file updated at `/docs/changelog.md` with each version entry.
- Rollback: Use previous tag; workflow nodes revert via branch merge.

## 7. Roles & Approvals
- Reviewer: Jesse Niesen
- QA Tester: [Name]
- Deployment approver: Liv Hana
- Human‑approval path: Triggered if state = yellow or red; sends Slack alert to #ops‑alerting.

## 8. Timeline & Milestones
- 2025‑10‑26: Design complete
- 2025‑10‑27: Implementation complete
- 2025‑10‑28: Testing complete
- 2025‑10‑29: Review & sign‑off
- 2025‑10‑30: Publish & tag

