/**
 * BigQuery Client
 * Handles BigQuery operations
 */

import { BigQuery } from '@google-cloud/bigquery';

interface CustomerProduct {
  product_id: string;
  product_name: string;
  purchase_count: number;
}

export class BigQueryClient {
  private bigquery: BigQuery;
  private dataset: string;

  constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID || 'reggieanddrodispensary',
    });

    this.dataset = process.env.BIGQUERY_DATASET || 'livhana_prod';
  }

  async getCustomerHistory(customerId: string): Promise<CustomerProduct[]> {
    const query = `
      SELECT
        product_id,
        product_name,
        COUNT(*) as purchase_count
      FROM \`${this.dataset}.sales\`
      WHERE customer_id = @customerId
      GROUP BY product_id, product_name
      ORDER BY purchase_count DESC
      LIMIT 20
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId },
        location: 'US',
      });

      return rows as CustomerProduct[];
    } catch (error) {
      console.warn('Failed to fetch customer history:', error);
      return [];
    }
  }

  async findProduct(
    searchTerm: string,
    customerId: string,
    history: CustomerProduct[]
  ): Promise<CustomerProduct | null> {
    const lowerSearch = searchTerm.toLowerCase();
    const match = history.find(p =>
      p.product_name.toLowerCase().includes(lowerSearch) ||
      p.product_id.toLowerCase().includes(lowerSearch)
    );

    if (match) {
      return match;
    }

    const query = `
      SELECT
        product_id,
        product_name,
        COUNT(*) as purchase_count
      FROM \`${this.dataset}.sales\`
      WHERE customer_id = @customerId
        AND (LOWER(product_name) LIKE @searchTerm OR LOWER(product_id) LIKE @searchTerm)
      GROUP BY product_id, product_name
      ORDER BY purchase_count DESC
      LIMIT 1
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId, searchTerm: `%${lowerSearch}%` },
        location: 'US',
      });

      return rows.length > 0 ? (rows[0] as CustomerProduct) : null;
    } catch (error) {
      console.warn('Failed to search products:', error);
      return null;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.bigquery.getDatasets({ maxResults: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

