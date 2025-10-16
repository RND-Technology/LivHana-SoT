### Database Seeder

**File:** `tests/helpers/db-seeder.ts`

```typescript
import { BigQuery } from '@google-cloud/bigquery';

export class TestDBSeeder {
  private bq: BigQuery;

  constructor() {
    this.bq = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });
  }

  async seedMemberships(count: number = 10) {
    const dataset = this.bq.dataset('commerce');
    const table = dataset.table('memberships');

    const rows = Array.from({ length: count }, (_, i) => ({
      id: `MEM-TEST-${i}`,
      customer_id: `CUST-TEST-${i}`,
      email: `test${i}@example.com`,
      tier: ['BRONZE', 'SILVER', 'GOLD'][i % 3],
      status: 'active',
      price: [47, 97, 197][i % 3],
      discount_percent: [10, 20, 30][i % 3],
      start_date: new Date().toISOString(),
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await table.insert(rows);
    console.log(`Seeded ${count} test memberships`);
  }

  async cleanupTestData() {
    // Delete all test records (prefix with "TEST-")
    const query = `
      DELETE FROM \`${process.env.GCP_PROJECT_ID}.commerce.memberships\`
      WHERE id LIKE 'MEM-TEST-%'
    `;
    await this.bq.query(query);
    console.log('Test data cleaned up');
  }
}
```

---
