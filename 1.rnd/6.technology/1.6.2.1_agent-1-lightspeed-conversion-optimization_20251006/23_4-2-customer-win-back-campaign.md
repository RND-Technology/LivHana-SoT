### 4.2 Customer Win-Back Campaign

**Target:** 11,348 past customers in database (per Texas Takeover plan)

**Implementation:**

```javascript
// backend/integration-service/src/winback-campaign.js

async function identifyWinBackCandidates() {
  const query = `
    SELECT
      customer_id,
      customer_email,
      MAX(created_at) as last_purchase_date,
      COUNT(*) as total_purchases,
      SUM(total) as lifetime_value,
      AVG(total) as avg_order_value
    FROM \`${PROJECT_ID}.analytics.lightspeed_transactions\`
    WHERE customer_id IS NOT NULL
      AND customer_email IS NOT NULL
    GROUP BY customer_id, customer_email
    HAVING DATE_DIFF(CURRENT_DATE(), DATE(MAX(created_at)), DAY) > 60
    ORDER BY lifetime_value DESC
    LIMIT 11348
  `;

  const [customers] = await bigquery.query({ query, location: LOCATION });

  // Segment by value
  const segments = {
    high_value: customers.filter(c => c.lifetime_value > 500),
    medium_value: customers.filter(c => c.lifetime_value > 150 && c.lifetime_value <= 500),
    low_value: customers.filter(c => c.lifetime_value <= 150)
  };

  return segments;
}

async function sendWinBackCampaign(segment, tier) {
  const offers = {
    high_value: { discount: 0.30, message: "We miss you! 30% off + free shipping" },
    medium_value: { discount: 0.25, message: "Welcome back! 25% off your next order" },
    low_value: { discount: 0.20, message: "Come back to R&D - 20% off" }
  };

  const offer = offers[tier];

  for (const customer of segment) {
    await sendEmail({
      to: customer.customer_email,
      subject: `${offer.message} - Reggie & Dro`,
      template: 'winback',
      data: {
        discount_percent: offer.discount * 100,
        last_purchase: customer.last_purchase_date,
        lifetime_value: customer.lifetime_value,
        coupon_code: generateCouponCode(customer.customer_id, offer.discount)
      }
    });
  }
}
```

**ROI Projection (Per Texas Takeover Plan):**

- **Target:** 4.4% conversion of 11,348 customers = 500 orders
- **AOV:** $150 per order
- **Revenue:** 500 orders × $150 = $75,000 in Month 1
- **Cost:** Email campaign = $500 (Mailgun/SendGrid)
- **Net:** $74,500 profit from win-back campaign
