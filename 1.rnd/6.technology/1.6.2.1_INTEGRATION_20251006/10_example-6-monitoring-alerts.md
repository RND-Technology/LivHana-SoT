## Example 6: Monitoring & Alerts

```javascript
// monitoring/age-verification-metrics.js
const { BigQuery } = require('@google-cloud/bigquery');
const { sendAlert } = require('../alerting');

const bigquery = new BigQuery();

async function checkMetrics() {
  // Check success rate (last hour)
  const successRateQuery = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) as successful
    FROM \`project.commerce.age_verification_attempts\`
    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
  `;

  const [rows] = await bigquery.query({ query: successRateQuery });
  const { total, successful } = rows[0];
  const successRate = total > 0 ? (successful / total) * 100 : 100;

  // Alert if success rate drops below 90%
  if (successRate < 90 && total > 10) {
    await sendAlert({
      severity: 'critical',
      title: 'Age Verification Success Rate Low',
      message: `Success rate is ${successRate.toFixed(2)}% (${successful}/${total}) in the last hour`,
      tags: ['age-verification', 'performance']
    });
  }

  // Check processing times
  const processingTimeQuery = `
    SELECT
      APPROX_QUANTILES(processing_time, 100)[OFFSET(95)] as p95_time
    FROM \`project.commerce.age_verification_attempts\`
    WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
      AND processing_time IS NOT NULL
  `;

  const [timeRows] = await bigquery.query({ query: processingTimeQuery });
  const p95Time = timeRows[0]?.p95_time;

  // Alert if p95 processing time > 500ms
  if (p95Time > 500) {
    await sendAlert({
      severity: 'warning',
      title: 'Age Verification Slow Response',
      message: `P95 processing time is ${p95Time}ms in the last hour`,
      tags: ['age-verification', 'performance']
    });
  }

  console.log(`Metrics check complete - Success: ${successRate.toFixed(2)}%, P95: ${p95Time}ms`);
}

// Run every 15 minutes
setInterval(checkMetrics, 15 * 60 * 1000);
```

---
