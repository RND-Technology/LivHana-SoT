### ⚠️ **Task 4A: Analytics Dashboard → Use BigQuery + Looker Studio (Not Custom React)**

**Translation:** Don't build custom React dashboard → Use GCP-native tools

**Why:**

- Trinity already uses BigQuery for analytics
- Looker Studio (free) integrates directly with BigQuery
- Faster to deploy than custom React + Flask backend
- Easier to maintain (no custom code to debug)

**Process:**

1. Set up BigQuery datasets (if not exists):

   ```sql
   CREATE SCHEMA IF NOT EXISTS reggieanddro_analytics;

   CREATE TABLE reggieanddro_analytics.daily_revenue (
     date DATE,
     revenue FLOAT64,
     orders INT64,
     aov FLOAT64
   );

   -- Populate via scheduled query (Cloud Scheduler → BigQuery)
   ```

2. Create Looker Studio dashboard:
   - Connect to BigQuery dataset
   - Add charts: Revenue trend, top products, conversion funnel
   - Share dashboard with team
   - Embed in empire-cockpit if needed (Looker Studio iframe)

3. Scheduled Data Updates:
   - Cloud Scheduler → Cloud Function → BigQuery INSERT
   - Runs every 15min to update metrics

**Evidence:** Looker Studio dashboard link + screenshot in `.evidence/2025-10-03/analytics/dashboard.png`

---
