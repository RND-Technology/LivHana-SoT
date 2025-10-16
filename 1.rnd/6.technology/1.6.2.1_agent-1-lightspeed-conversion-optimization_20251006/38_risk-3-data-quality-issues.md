### Risk 3: Data Quality Issues

**Probability:** MEDIUM
**Impact:** HIGH (bad data = bad decisions)

**Current Exposure:**

- No validation before BigQuery insert
- Missing fields = null values = incomplete analytics
- Type mismatches = insert failures

**Mitigation:**

- Implement schema validation (Section 3.4)
- Add data quality monitoring dashboard
- Alert on anomalies (e.g., sudden drop in transactions)

```javascript
// Data quality monitoring
async function monitorDataQuality() {
  const query = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as transaction_count,
      SUM(CASE WHEN customer_id IS NULL THEN 1 ELSE 0 END) as missing_customer_ids,
      SUM(CASE WHEN total <= 0 THEN 1 ELSE 0 END) as invalid_totals
    FROM \`${PROJECT_ID}.analytics.lightspeed_transactions\`
    WHERE DATE(created_at) = CURRENT_DATE()
  `;

  const [rows] = await bigquery.query({ query });
  const metrics = rows[0];

  // Alert if data quality issues detected
  if (metrics.missing_customer_ids > 50) {
    await sendSlackAlert(`⚠️ ${metrics.missing_customer_ids} transactions missing customer IDs today`);
  }

  if (metrics.invalid_totals > 0) {
    await sendSlackAlert(`🚨 ${metrics.invalid_totals} transactions with invalid totals detected`);
  }
}
```
