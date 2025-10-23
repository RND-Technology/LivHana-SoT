---
status: ACTIVE - Week 1 Prototyping Assignment
assigned_to: Replit
priority: APEX - Foundation for Empire-Empire Integration
due: 2025-10-14 (7 days)
---

# REPLIT WEEK 1: FOUNDATION PROTOTYPES

**Mission**: Build 5 working prototypes that prove the Empire-Empire integration works.

**Pipeline**: Replit prototypes → Claude Code hardens → Cheetah deploys → Production

**Success Criteria**: Each prototype works with test data, demonstrably shows core functionality.

---

## 📋 PROTOTYPE ASSIGNMENTS (PRIORITY ORDER)

### Prototype 1: Lightspeed → BigQuery Pipeline ⭐ CRITICAL

**File**: `backend/integration-service/src/lightspeed-bigquery.js`
**What**: Stream sales data from Lightspeed to BigQuery in real-time
**Why**: Foundation for ALL SI capabilities

**Requirements**:

```javascript
class LightspeedBigQueryPipeline {
  constructor() {
    this.lightspeed = new LightspeedAPI(process.env.LIGHTSPEED_TOKEN);
    this.bigquery = new BigQuery({ projectId: 'reggieanddrodispensary' });
  }

  async streamSalesData() {
    // 1. Fetch recent sales from Lightspeed
    const sales = await this.lightspeed.getSales({ since: 'last_sync' });

    // 2. Transform to BigQuery schema
    const rows = sales.map(sale => ({
      timestamp: sale.completed_at,
      customer_id: sale.customer?.id || 'anonymous',
      product_id: sale.Sale_Lines[0]?.Item?.itemID,
      product_name: sale.Sale_Lines[0]?.Item?.description,
      quantity: sale.Sale_Lines[0]?.unitQuantity,
      price: sale.Sale_Lines[0]?.calcTotal,
      payment_method: sale.SalePayments[0]?.PaymentType?.name
    }));

    // 3. Insert into BigQuery
    await this.bigquery
      .dataset('livhana_prod')
      .table('sales')
      .insert(rows);

    return { success: true, inserted: rows.length };
  }
}
```

**Test Data**: Use Lightspeed test environment
**Success**: Sales appear in BigQuery within 60 seconds of creation
**Deliverable**: Code + test results + BigQuery table screenshot

---

### Prototype 2: Customer Profile API

**File**: `backend/common/src/customer-profile-service.js`
**What**: Unified customer profile enriched from all data sources
**Why**: Can't personalize without knowing the customer

**Requirements**:

```javascript
class CustomerProfileService {
  async getEnrichedProfile(customerId) {
    // Fetch data from all sources in parallel
    const [purchases, inventory, analytics] = await Promise.all([
      this.bigquery.query(`
        SELECT product_id, COUNT(*) as purchase_count, MAX(timestamp) as last_purchase
        FROM livhana_prod.sales
        WHERE customer_id = @customerId
        GROUP BY product_id
      `, { customerId }),

      this.lightspeed.getCustomerInfo(customerId),

      this.bigquery.query(`
        SELECT content_type, COUNT(*) as views, AVG(engagement_time) as avg_time
        FROM livhana_prod.content_analytics
        WHERE customer_id = @customerId
        GROUP BY content_type
      `, { customerId })
    ]);

    // Synthesize into unified profile
    return {
      id: customerId,
      basic: inventory,
      purchase_history: purchases,
      preferences: this.extractPreferences(purchases),
      content_engagement: analytics,
      predictions: {
        next_purchase_date: this.predictNextPurchase(purchases),
        likely_products: this.predictProducts(purchases)
      }
    };
  }

  extractPreferences(purchases) {
    // Simple heuristic: most purchased product categories
    const categories = {};
    purchases.forEach(p => {
      const cat = p.product_id.split('-')[0]; // Simple category extraction
      categories[cat] = (categories[cat] || 0) + p.purchase_count;
    });
    return categories;
  }

  predictNextPurchase(purchases) {
    // Simple heuristic: average days between purchases
    if (purchases.length < 2) return null;
    const avgDays = 30; // Placeholder, calculate from actual data
    const lastPurchase = new Date(purchases[0].last_purchase);
    return new Date(lastPurchase.getTime() + avgDays * 24 * 60 * 60 * 1000);
  }

  predictProducts(purchases) {
    // Simple heuristic: previously purchased products
    return purchases.slice(0, 5).map(p => ({
      product_id: p.product_id,
      confidence: p.purchase_count / purchases.length
    }));
  }
}
```

**API Endpoint**: `GET /api/customers/:id/profile`
**Test**: Query for known customer, validate predictions make sense
**Success**: Returns enriched profile with predictions
**Deliverable**: API code + OpenAPI spec + sample response JSON

---

### Prototype 3: SI Recommendation Engine

**File**: `backend/reasoning-gateway/src/si-recommendations.js`
**What**: Personalized product recommendations based on customer profile
**Why**: Direct revenue impact (2-5x conversion rate)

**Requirements**:

```javascript
class SIRecommendationEngine {
  async getRecommendations(customerId) {
    // Get customer profile
    const profile = await this.profiles.getEnrichedProfile(customerId);

    // Simple collaborative filtering: find similar customers
    const query = `
      WITH customer_products AS (
        SELECT product_id
        FROM livhana_prod.sales
        WHERE customer_id = @customerId
      ),
      similar_customers AS (
        SELECT s.customer_id, COUNT(*) as overlap
        FROM livhana_prod.sales s
        WHERE s.product_id IN (SELECT product_id FROM customer_products)
        AND s.customer_id != @customerId
        GROUP BY s.customer_id
        ORDER BY overlap DESC
        LIMIT 50
      )
      SELECT s.product_id, COUNT(*) as purchase_count
      FROM livhana_prod.sales s
      JOIN similar_customers sc ON s.customer_id = sc.customer_id
      WHERE s.product_id NOT IN (SELECT product_id FROM customer_products)
      GROUP BY s.product_id
      ORDER BY purchase_count DESC
      LIMIT 10
    `;

    const recommendations = await this.bigquery.query(query, { customerId });

    // Add explanations
    return recommendations.map(r => ({
      product_id: r.product_id,
      reason: `${r.purchase_count} similar customers purchased this`,
      confidence: Math.min(r.purchase_count / 50, 1.0)
    }));
  }
}
```

**API Endpoint**: `GET /api/recommendations/:customerId`
**Test**: Validate recommendations are different from random
**Success**: Returns 10 personalized recommendations with explanations
**Deliverable**: API code + accuracy comparison (SI vs random) + examples

---

### Prototype 4: Content-Commerce Bridge (UI)

**File**: `frontend/herbitrage-voice/src/components/VideoPlayer.jsx`
**What**: Video player with embedded product purchase
**Why**: Unique advantage (no competitor has content + commerce integration)

**Requirements**:

```jsx
import React, { useState, useEffect } from 'react';

function VideoPlayerWithCommerce({ episodeId, customerId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [showProduct, setShowProduct] = useState(null);

  useEffect(() => {
    // Fetch recommendations
    fetch(`/api/recommendations/${customerId}`)
      .then(r => r.json())
      .then(setRecommendations);
  }, [customerId]);

  const handleTimeUpdate = (currentTime) => {
    // Show product placement at optimal times
    const placements = {
      30: recommendations[0],  // 30 seconds in
      90: recommendations[1],  // 90 seconds in
      150: recommendations[2]  // 150 seconds in
    };

    if (placements[Math.floor(currentTime)]) {
      setShowProduct(placements[Math.floor(currentTime)]);
    }
  };

  const handlePurchase = async (product) => {
    // One-click purchase
    const response = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, productId: product.product_id })
    });

    if (response.ok) {
      alert(`Purchased ${product.product_id}!`);
      setShowProduct(null);
    }
  };

  return (
    <div className="video-container">
      <video
        src={`/episodes/${episodeId}.mp4`}
        controls
        onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
      />

      {showProduct && (
        <div className="product-overlay">
          <h3>{showProduct.product_id}</h3>
          <p>{showProduct.reason}</p>
          <button onClick={() => handlePurchase(showProduct)}>
            Buy Now
          </button>
          <button onClick={() => setShowProduct(null)}>
            Later
          </button>
        </div>
      )}

      <div className="recommendations-sidebar">
        <h4>Featured Products</h4>
        {recommendations.map(r => (
          <div key={r.product_id} onClick={() => setShowProduct(r)}>
            {r.product_id}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Test**: Watch video, see product overlay, click "Buy Now", verify in logs
**Success**: Product purchase completes while watching video
**Deliverable**: React component + demo video + purchase flow screenshot

---

### Prototype 5: Voice-to-Purchase (Stretch Goal)

**File**: `backend/reasoning-gateway/src/voice-commerce.js`
**What**: Voice command → Product purchase pipeline
**Why**: Zero friction = maximum conversion

**Requirements**:

```javascript
class VoiceCommerceEngine {
  async processVoiceCommand(transcript, customerId) {
    // Use Claude to extract intent
    const intentPrompt = `
User said: "${transcript}"
Customer purchases: ${JSON.stringify(await this.getCustomerHistory(customerId))}

Extract:
1. Intent (reorder | new_purchase | question | feedback)
2. Product (if mentioned)
3. Quantity (if mentioned)

Response format: { intent, product, quantity }
`;

    const intent = await this.claude.complete(intentPrompt);

    if (intent.intent === 'reorder') {
      // Find matching product from history
      const product = await this.findProduct(intent.product, customerId);

      // Create order
      const order = await this.lightspeed.createSale({
        customer_id: customerId,
        items: [{ product_id: product.id, quantity: intent.quantity || 1 }]
      });

      return {
        success: true,
        message: `Ordered ${product.name}. Total: $${order.total}`,
        order_id: order.id
      };
    }

    // Handle other intents...
    return { success: false, message: 'Could not process command' };
  }
}
```

**API Endpoint**: `POST /api/voice-commerce` (body: `{ transcript, customerId }`)
**Test**: Send "I need more sleep gummies" → Verify order created
**Success**: Voice command results in Lightspeed order
**Deliverable**: API code + test examples + error handling

---

## 📊 SUCCESS CRITERIA (FOR EACH PROTOTYPE)

### Functional Requirements

- [ ] Code runs without errors
- [ ] Test data produces expected output
- [ ] Error handling for common failures
- [ ] Logging for debugging

### Documentation Requirements

- [ ] README with setup instructions
- [ ] API documentation (if applicable)
- [ ] Test examples with sample data
- [ ] Known limitations listed

### Handoff Requirements

- [ ] Code pushed to git (branch: `replit-prototypes-week1`)
- [ ] Demo video or screenshots
- [ ] Test results documented
- [ ] Next steps identified (for Claude Code hardening)

---

## 🎯 DELIVERABLES CHECKLIST

By End of Week (Oct 14, 2025):

- [ ] Prototype 1: Lightspeed → BigQuery (working + tested)
- [ ] Prototype 2: Customer Profile API (working + tested)
- [ ] Prototype 3: SI Recommendations (working + tested)
- [ ] Prototype 4: Video + Commerce UI (working + tested)
- [ ] Prototype 5: Voice Commerce (stretch goal)

All prototypes pushed to git with documentation.

---

## 🛠️ TECHNICAL SETUP

### Environment Variables Needed

```bash
# Lightspeed
LIGHTSPEED_TOKEN=op://LivHana-Ops-Keys/LIGHTSPEED_PERSONAL_TOKEN/credential

# Google Cloud
GCP_PROJECT_ID=reggieanddrodispensary
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# BigQuery
BIGQUERY_DATASET=livhana_prod

# Anthropic
ANTHROPIC_API_KEY=<from 1Password>
```

### BigQuery Tables Needed

```sql
-- Sales table
CREATE TABLE livhana_prod.sales (
  timestamp TIMESTAMP,
  customer_id STRING,
  product_id STRING,
  product_name STRING,
  quantity INT64,
  price FLOAT64,
  payment_method STRING
);

-- Content analytics table
CREATE TABLE livhana_prod.content_analytics (
  timestamp TIMESTAMP,
  customer_id STRING,
  content_type STRING,
  content_id STRING,
  views INT64,
  engagement_time FLOAT64
);
```

### Dependencies

```json
{
  "dependencies": {
    "@google-cloud/bigquery": "^7.0.0",
    "@anthropic-ai/sdk": "latest",
    "express": "^4.18.0",
    "react": "^18.2.0"
  }
}
```

---

## 🏁 NEXT STEPS AFTER PROTOTYPING

### Week 2: Claude Code Hardens

- Production error handling
- Comprehensive testing
- Monitoring and alerting
- Performance optimization
- Security review

### Week 3: Cheetah Deploys

- Cloud Run deployment
- Domain configuration
- Production monitoring
- Load testing
- Go-live

---

**Status**: Ready for Replit prototyping ✅
**Timeline**: 7 days to complete all 5 prototypes
**Success**: Working prototypes demonstrating Empire-Empire integration
**Next**: Claude Code hardens → Cheetah deploys → Production

---

**Last Updated**: 2025-10-08T04:55Z
**Assigned By**: Claude Code (Sonnet 4.5)
**Assigned To**: Replit
**Due Date**: 2025-10-14
