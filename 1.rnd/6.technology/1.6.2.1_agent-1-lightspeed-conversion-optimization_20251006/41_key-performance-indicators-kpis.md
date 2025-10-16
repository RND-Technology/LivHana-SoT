### Key Performance Indicators (KPIs)

**Conversion Metrics:**

```javascript
// backend/integration-service/src/conversion-metrics.js

async function calculateConversionMetrics() {
  const query = `
    WITH funnel AS (
      SELECT
        DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(total) as revenue,
        AVG(total) as aov,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM \`${PROJECT_ID}.analytics.lightspeed_transactions\`
      WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      GROUP BY date
    )
    SELECT
      date,
      transactions,
      revenue,
      aov,
      unique_customers,
      transactions / unique_customers as repeat_purchase_rate
    FROM funnel
    ORDER BY date DESC
  `;

  const [rows] = await bigquery.query({ query });
  return rows;
}
```

**Success Targets (Month 1):**

- Conversion Rate: 3% → 4.5% (+50%)
- Average Order Value: $150 → $210 (+40%)
- Cart Abandonment Recovery: 0% → 10%
- Repeat Purchase Rate: 15% → 30% (+100%)
- Customer LTV: $600 → $1,200 (+100%)

**Dashboard Metrics:**

```javascript
{
  "conversion_optimization": {
    "baseline": {
      "conversion_rate": 0.03,
      "aov": 150,
      "monthly_revenue": 100000
    },
    "current": {
      "conversion_rate": 0.045,  // Target after improvements
      "aov": 210,
      "monthly_revenue": 152000
    },
    "lift": {
      "conversion_rate_increase": "+50%",
      "aov_increase": "+40%",
      "revenue_increase": "+52%"
    }
  },
  "texas_market_specific": {
    "brick_weed_sales": 35000,
    "value_flower_sales": 70000,
    "top_shelf_sales": 47000,
    "veteran_discount_redemptions": 150,
    "local_pickup_orders": 200
  },
  "customer_lifecycle": {
    "new_customers": 100,
    "returning_customers": 400,
    "win_back_conversions": 50,
    "loyalty_members": 200,
    "subscription_members": 20
  }
}
```

---
