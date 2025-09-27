### BUSINESS INTELLIGENCE COORDINATION

Objectives:
- Provide a single source of truth for revenue, compliance, and operations.

KPI Tree:
- North Star: Monthly EBITDA
- Drivers: Revenue, COGS, OPEX
- Levers: Price, Mix, Conversion, Retention, Utilization, Tax

Data Model:
- Facts: orders, sessions, experiments, incidents, audits
- Dimensions: time, customer, product/strain, market, channel, lab
- Quality: freshness SLA, schema contracts, tests (unique, not-null, ref)

Dashboards:
- Executive: EBITDA, growth, NRR, cash runway
- Ops: SLA/SLO, error rate, latency, queue depth, on-call burn
- Compliance: 21+ pass rate, COA validity, audit events, report status

Cadence:
- Daily: red/yellow alerts and top-3 actions
- Weekly: experiment review, KPI deltas, next bets
- Monthly: strategy checkpoint, budget/targets refresh

Governance:
- Metric definitions versioned; changes require owner review
- Data access by role; audit all exports and PII access

