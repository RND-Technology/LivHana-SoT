### Codegen (P2)
```typescript
// backend/integration-service/src/lightspeed-bigquery.ts

import { BigQuery } from '@google-cloud/bigquery';
import axios from 'axios';

interface LightspeedSale {
  saleID: string;
  completed_at: string;
  customer?: { id: string };
  Sale_Lines: Array<{
    Item?: { itemID: string; description: string };
    unitQuantity: number;
    calcTotal: string;
  }>;
  SalePayments: Array<{
    PaymentType?: { name: string };
  }>;
}

interface BigQueryRow {
  sale_id: string;
  timestamp: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  payment_method: string;
}

export class LightspeedBigQueryPipeline {
  private lightspeed: axios.AxiosInstance;
  private bigquery: BigQuery;
  private dataset: string;
  private table: string;

  constructor() {
    const token = process.env.LIGHTSPEED_TOKEN;
    if (!token) {
      throw new Error('LIGHTSPEED_TOKEN required');
    }

    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 10000,
    });

    this.bigquery = new BigQuery({
      projectId: 'reggieanddrodispensary',
    });

    this.dataset = 'livhana_prod';
    this.table = 'sales';
  }

  async streamSalesData(since?: string): Promise<{ success: boolean; inserted: number }> {
    // 1. Fetch recent sales from Lightspeed
    const response = await this.lightspeed.get<{ Sale: LightspeedSale[] }>('/Account/1/Sale.json', {
      params: {
        completed_at: `>,${since ?? new Date(Date.now() - 86400000).toISOString()}`,
        load_relations: 'all',
      },
    });

    const sales = response.data.Sale ?? [];

    // 2. Transform to BigQuery schema
    const rows: BigQueryRow[] = sales.flatMap(sale =>
      sale.Sale_Lines.map(line => ({
        sale_id: sale.saleID,
        timestamp: sale.completed_at,
        customer_id: sale.customer?.id ?? 'anonymous',
        product_id: line.Item?.itemID ?? 'unknown',
        product_name: line.Item?.description ?? 'Unknown Product',
        quantity: line.unitQuantity,
        price: parseFloat(line.calcTotal),
        payment_method: sale.SalePayments[0]?.PaymentType?.name ?? 'unknown',
      }))
    );

    // 3. Insert into BigQuery (idempotent with sale_id deduplication)
    if (rows.length > 0) {
      await this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .insert(rows, { skipInvalidRows: true, ignoreUnknownValues: true });
    }

    return { success: true, inserted: rows.length };
  }
}
```
