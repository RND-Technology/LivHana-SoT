### 🔴 **BLOCKER #1: PostgreSQL vs BigQuery Confusion**

**Claim:** "Database: PostgreSQL 13+ with TimescaleDB for time-series"
**Reality:** Trinity uses BigQuery for analytics (`cannabis_data.lightspeed_products`, `cannabis_data.square_payments`)
**Evidence:** `.claude/SESSION_PROGRESS.md` shows BigQuery tables created, no PostgreSQL references

**Resolution Required:**

1. Determine transactional vs analytical split:
   - **Transactional** (verification flags, loyalty, orders pending): Use Cloud SQL (PostgreSQL) OR Firebase Realtime Database
   - **Analytical** (sales reports, funnel metrics, dashboard): Use BigQuery
2. Update all database schemas in guide to match chosen architecture
3. Build data pipeline: Cloud SQL → BigQuery (via Cloud Functions or Dataflow) for analytics

**Action:** Read existing backend code to confirm database strategy

```bash
grep -r "database\|db\|sql\|bigquery" backend/ empire/ --include="*.py" --include="*.ts" --include="*.js" | head -50
```

---
