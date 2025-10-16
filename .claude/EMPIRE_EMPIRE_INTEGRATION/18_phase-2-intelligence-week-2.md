### Phase 2: Intelligence (Week 2)

**Prototype 3: SI Recommendation Engine**
```javascript
// File: backend/reasoning-gateway/src/si-recommendations.js

class SIRecommendationEngine {
  async getPersonalizedRecommendations(customerId) {
    // Get customer profile
    const profile = await this.profiles.get(customerId);

    // Query BigQuery for similar customers
    const query = `
      SELECT product_id, COUNT(*) as purchase_count, AVG(rating) as avg_rating
      FROM sales s
      JOIN ratings r ON s.sale_id = r.sale_id
      WHERE customer_id IN (
        SELECT similar_customer_id
        FROM customer_similarity
        WHERE customer_id = @customerId
        LIMIT 100
      )
      AND product_id NOT IN (
        SELECT product_id FROM customer_purchases WHERE customer_id = @customerId
      )
      GROUP BY product_id
      ORDER BY purchase_count DESC, avg_rating DESC
      LIMIT 10
    `;

    const products = await this.bigquery.query(query, { customerId });

    // Explain recommendations
    return products.map(p => ({
      product: p,
      reason: this.explainRecommendation(profile, p),
      confidence: this.calculateConfidence(profile, p)
    }));
  }
}
```

**Deliverable**: Recommendation API with explanations
**Test**: Validate against known customer preferences
**Handoff**: API + accuracy metrics + A/B test plan

**Prototype 4: Content-Commerce Bridge**
```javascript
// File: frontend/herbitrage-voice/src/components/VideoPlayer.jsx

function PersonalizedVideoPlayer({ episodeId, customerId }) {
  const { recommendations } = useSIRecommendations(customerId);

  return (
    <div>
      <video src={`/episodes/${episodeId}`} />

      {/* Product placements appear at optimal times */}
      <ProductPlacement
        products={recommendations}
        timings={getOptimalPlacementTimes(episodeId)}
        onPurchase={(product) => handleOneClickPurchase(product, customerId)}
      />

      {/* Track engagement */}
      <EngagementTracker
        onView={() => trackView(episodeId, customerId)}
        onPurchase={(product) => trackConversion(episodeId, product, customerId)}
      />
    </div>
  );
}
```

**Deliverable**: Working video player with embedded product purchase
**Test**: Watch video, buy product, verify in Lightspeed
**Handoff**: React component + Lightspeed integration + analytics
