### Codegen (P2)
```typescript
// backend/common/src/customer-profile-service.ts

import { BigQuery } from '@google-cloud/bigquery';
import axios from 'axios';

export class CustomerProfileService {
  private bigquery: BigQuery;
  private lightspeed: axios.AxiosInstance;

  constructor() {
    this.bigquery = new BigQuery({ projectId: 'reggieanddrodispensary' });
    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: { 'Authorization': `Bearer ${process.env.LIGHTSPEED_TOKEN}` },
    });
  }

  async getEnrichedProfile(customerId: string) {
    // Fetch data from all sources in parallel
    const [purchases, inventory, analytics] = await Promise.all([
      this.bigquery.query({
        query: `
          SELECT product_id, COUNT(*) as purchase_count, MAX(timestamp) as last_purchase
          FROM livhana_prod.sales
          WHERE customer_id = @customerId
          GROUP BY product_id
        `,
        params: { customerId },
      }),

      this.lightspeed.get(`/Account/1/Customer/${customerId}.json`).catch(() => null),

      this.bigquery.query({
        query: `
          SELECT content_type, COUNT(*) as views, AVG(engagement_time) as avg_time
          FROM livhana_prod.content_analytics
          WHERE customer_id = @customerId
          GROUP BY content_type
        `,
        params: { customerId },
      }).catch(() => []),
    ]);

    // Synthesize into unified profile
    return {
      id: customerId,
      basic: inventory?.data?.Customer ?? {},
      purchase_history: purchases[0] ?? [],
      preferences: this.extractPreferences(purchases[0] ?? []),
      content_engagement: analytics[0] ?? [],
      predictions: {
        next_purchase_date: this.predictNextPurchase(purchases[0] ?? []),
        likely_products: this.predictProducts(purchases[0] ?? []),
      },
    };
  }

  private extractPreferences(purchases: any[]) {
    const categories: Record<string, number> = {};
    purchases.forEach(p => {
      const cat = p.product_id?.split('-')[0] ?? 'other';
      categories[cat] = (categories[cat] ?? 0) + p.purchase_count;
    });
    return categories;
  }

  private predictNextPurchase(purchases: any[]) {
    if (purchases.length < 2) return null;
    const avgDays = 30;
    const lastPurchase = new Date(purchases[0]?.last_purchase);
    return new Date(lastPurchase.getTime() + avgDays * 24 * 60 * 60 * 1000).toISOString();
  }

  private predictProducts(purchases: any[]) {
    return purchases.slice(0, 5).map(p => ({
      product_id: p.product_id,
      confidence: p.purchase_count / purchases.length,
    }));
  }
}
```

---
