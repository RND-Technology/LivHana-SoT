### Codegen (P2)
```typescript
// backend/reasoning-gateway/src/si-recommendations.ts

import { BigQuery } from '@google-cloud/bigquery';

export class SIRecommendationEngine {
  private bigquery: BigQuery;

  constructor() {
    this.bigquery = new BigQuery({ projectId: 'reggieanddrodispensary' });
  }

  async getRecommendations(customerId: string) {
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

    const [recommendations] = await this.bigquery.query({ query, params: { customerId } });

    return (recommendations ?? []).map((r: any) => ({
      product_id: r.product_id,
      reason: `${r.purchase_count} similar customers purchased this`,
      confidence: Math.min(r.purchase_count / 50, 1.0),
    }));
  }
}
```

---
