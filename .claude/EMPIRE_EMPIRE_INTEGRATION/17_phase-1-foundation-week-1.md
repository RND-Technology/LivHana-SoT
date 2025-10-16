### Phase 1: Foundation (Week 1)

**Prototype 1: Lightspeed → BigQuery Pipeline**
```javascript
// File: backend/integration-service/src/lightspeed-bigquery.js

class LightspeedBigQueryPipeline {
  async streamSalesData() {
    // Connect to Lightspeed API
    const token = process.env.LIGHTSPEED_TOKEN;
    const sales = await this.fetchRecentSales(token);

    // Transform to BigQuery schema
    const rows = sales.map(sale => ({
      timestamp: sale.completed_at,
      customer_id: sale.customer_id,
      product_id: sale.item_id,
      quantity: sale.quantity,
      price: sale.price,
      payment_method: sale.payment_type
    }));

    // Insert into BigQuery
    await this.bigquery.dataset('livhana_prod')
      .table('sales')
      .insert(rows);

    return { inserted: rows.length };
  }
}

// Test: Does it work?
// Success criteria: Sales appear in BigQuery within 60 seconds
```

**Deliverable**: Working prototype that streams 1 sale to BigQuery
**Test Data**: Use Lightspeed test environment
**Handoff**: Code + test results + deployment instructions

**Prototype 2: Customer Profile API**
```javascript
// File: backend/common/src/customer-profile.js

class CustomerProfileService {
  async getEnrichedProfile(customerId) {
    // Fetch from all sources in parallel
    const [
      purchases,
      emails,
      contentViews,
      socialActivity
    ] = await Promise.all([
      this.lightspeed.getPurchaseHistory(customerId),
      this.gmail.getCustomerEmails(customerId),
      this.bigquery.getContentEngagement(customerId),
      this.social.getActivity(customerId)
    ]);

    // Synthesize into unified profile
    return {
      id: customerId,
      preferences: this.extractPreferences(purchases, emails),
      behavior: this.analyzeBehavior(contentViews, socialActivity),
      predictions: {
        next_purchase_date: this.predictNextPurchase(purchases),
        likely_products: this.predictProducts(purchases, preferences),
        churn_risk: this.predictChurn(behavior)
      }
    };
  }
}
```

**Deliverable**: API endpoint returning enriched customer profile
**Test**: Query for known customer, validate predictions
**Handoff**: OpenAPI spec + sample responses + integration guide
