// LIGHTSPEED BIGQUERY PIPELINE - PROTOTYPE 1
// Real-time sales data streaming from Lightspeed to BigQuery
// Implements idempotent insertion and graceful error handling

import { BigQuery } from '@google-cloud/bigquery';
import axios, { AxiosInstance } from 'axios';

// TypeScript strict mode - no 'any' types allowed
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

interface SyncResult {
  success: boolean;
  inserted: number;
  skipped: number;
  lastSync: string;
  latency_ms: number;
  errors: Array<{ sale_id: string; error: string }>;
}

interface SyncRequest {
  since?: string;
  batch_size?: number;
}

export class LightspeedBigQueryPipeline {
  private lightspeed: AxiosInstance;
  private bigquery: BigQuery;
  private dataset: string;
  private table: string;

  constructor() {
    const token = process.env.LIGHTSPEED_TOKEN;
    if (!token) {
      throw new Error('LIGHTSPEED_TOKEN environment variable required');
    }

    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID || 'reggieanddrodispensary',
    });

    this.dataset = process.env.BIGQUERY_DATASET || 'livhana_prod';
    this.table = 'sales';
  }

  /**
   * Sync sales data from Lightspeed to BigQuery
   * Implements idempotent insertion to prevent duplicates
   */
  async syncSalesData(request: SyncRequest = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const since = request.since || new Date(Date.now() - 86400000).toISOString(); // 24h ago
    const batchSize = Math.min(request.batch_size || 100, 1000); // Max 1000 per batch

    try {
      // 1. Fetch recent sales from Lightspeed
      const sales = await this.fetchSalesFromLightspeed(since, batchSize);
      
      if (sales.length === 0) {
        return {
          success: true,
          inserted: 0,
          skipped: 0,
          lastSync: since,
          latency_ms: Date.now() - startTime,
          errors: [],
        };
      }

      // 2. Transform to BigQuery schema
      const rows = this.transformSalesToBigQuery(sales);
      
      // 3. Insert into BigQuery (idempotent)
      const insertResult = await this.insertToBigQuery(rows);
      
      // 4. Calculate metrics
      const lastSync = sales.reduce((latest, sale) => 
        sale.completed_at > latest ? sale.completed_at : latest, sales[0]?.completed_at || since
      );

      return {
        success: true,
        inserted: insertResult.inserted,
        skipped: insertResult.skipped,
        lastSync,
        latency_ms: Date.now() - startTime,
        errors: insertResult.errors,
      };

    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        inserted: 0,
        skipped: 0,
        lastSync: since,
        latency_ms: Date.now() - startTime,
        errors: [{ sale_id: 'unknown', error: error instanceof Error ? error.message : 'Unknown error' }],
      };
    }
  }

  /**
   * Fetch sales from Lightspeed API with pagination
   */
  private async fetchSalesFromLightspeed(since: string, limit: number): Promise<LightspeedSale[]> {
    const allSales: LightspeedSale[] = [];
    let offset = 0;
    const pageSize = Math.min(limit, 100); // Lightspeed max page size

    while (allSales.length < limit) {
      try {
        const response = await this.lightspeed.get<{ Sale: LightspeedSale[] }>('/Account/1/Sale.json', {
          params: {
            completed_at: `>,${since}`,
            load_relations: 'all',
            limit: pageSize,
            offset,
          },
        });

        const sales = response.data.Sale || [];
        if (sales.length === 0) break; // No more sales

        allSales.push(...sales);
        offset += pageSize;

        if (sales.length < pageSize) break; // Last page
      } catch (error) {
        console.error(`Failed to fetch sales page ${offset}:`, error);
        break; // Continue with what we have
      }
    }

    return allSales.slice(0, limit);
  }

  /**
   * Transform Lightspeed sales to BigQuery schema
   * Handles missing fields gracefully
   */
  private transformSalesToBigQuery(sales: LightspeedSale[]): BigQueryRow[] {
    const rows: BigQueryRow[] = [];

    // Handle null/undefined inputs gracefully
    if (!sales || !Array.isArray(sales)) {
      return rows;
    }

    for (const sale of sales) {
      // Validate required fields
      if (!sale.saleID || !sale.completed_at) {
        console.warn(`Skipping sale with missing required fields: ${sale.saleID}`);
        continue;
      }

      // Transform each sale line to a BigQuery row
      for (const line of sale.Sale_Lines) {
        const quantity = line.unitQuantity || 0;
        const price = parseFloat(line.calcTotal) || 0;

        // Skip invalid rows
        if (quantity <= 0 || price <= 0) {
          console.warn(`Skipping invalid line item: quantity=${quantity}, price=${price}`);
          continue;
        }

        rows.push({
          sale_id: sale.saleID,
          timestamp: sale.completed_at,
          customer_id: sale.customer?.id || 'anonymous',
          product_id: line.Item?.itemID || 'unknown',
          product_name: line.Item?.description || 'Unknown Product',
          quantity,
          price,
          payment_method: sale.SalePayments[0]?.PaymentType?.name || 'unknown',
        });
      }
    }

    return rows;
  }

  /**
   * Insert rows into BigQuery with idempotent deduplication
   */
  private async insertToBigQuery(rows: BigQueryRow[]): Promise<{ inserted: number; skipped: number; errors: Array<{ sale_id: string; error: string }> }> {
    if (rows.length === 0) {
      return { inserted: 0, skipped: 0, errors: [] };
    }

    const errors: Array<{ sale_id: string; error: string }> = [];
    let inserted = 0;
    const skipped = 0;

    try {
      // Use MERGE statement for idempotent insertion
      const mergeQuery = `
        MERGE \`${this.dataset}.${this.table}\` T
        USING (
          SELECT * FROM UNNEST(@rows)
        ) S
        ON T.sale_id = S.sale_id AND T.product_id = S.product_id
        WHEN NOT MATCHED THEN
          INSERT (sale_id, timestamp, customer_id, product_id, product_name, quantity, price, payment_method)
          VALUES (sale_id, timestamp, customer_id, product_id, product_name, quantity, price, payment_method)
      `;

      const [job] = await this.bigquery.createQueryJob({
        query: mergeQuery,
        params: { rows },
        location: 'US',
      });

      await job.getQueryResults();
      inserted = rows.length; // All rows were processed
      
    } catch (error) {
      console.error('BigQuery insertion failed:', error);
      
      // Fallback to individual row insertion with error handling
      for (const row of rows) {
        try {
          await this.bigquery
            .dataset(this.dataset)
            .table(this.table)
            .insert([row], { 
              skipInvalidRows: true, 
              ignoreUnknownValues: true 
            });
          inserted++;
        } catch (rowError) {
          errors.push({
            sale_id: row.sale_id,
            error: rowError instanceof Error ? rowError.message : 'Unknown error',
          });
        }
      }
    }

    return { inserted, skipped, errors };
  }

  /**
   * Health check for service monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    lightspeed_connected: boolean;
    bigquery_connected: boolean;
    last_sync?: string;
  }> {
    const timestamp = new Date().toISOString();
    let lightspeedConnected = false;
    let bigqueryConnected = false;

    // Test Lightspeed connection
    try {
      await this.lightspeed.get('/Account/1.json', { timeout: 5000 });
      lightspeedConnected = true;
    } catch (error) {
      console.warn('Lightspeed health check failed:', error);
    }

    // Test BigQuery connection
    try {
      await this.bigquery.getDatasets({ maxResults: 1 });
      bigqueryConnected = true;
    } catch (error) {
      console.warn('BigQuery health check failed:', error);
    }

    const status = lightspeedConnected && bigqueryConnected ? 'healthy' : 
                  lightspeedConnected || bigqueryConnected ? 'degraded' : 'unhealthy';

    return {
      status,
      timestamp,
      version: '1.0.0',
      lightspeed_connected: lightspeedConnected,
      bigquery_connected: bigqueryConnected,
    };
  }
}

// Express.js integration for Cloud Run deployment
import express from 'express';

const app = express();
app.use(express.json());

// Only create pipeline if not in test environment
let pipeline: LightspeedBigQueryPipeline | null = null;
if (process.env.NODE_ENV !== 'test') {
  pipeline = new LightspeedBigQueryPipeline();
}

// Health check endpoint
app.get('/health', async (_req, res): Promise<void> => {
  try {
    if (!pipeline) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Pipeline not initialized',
      });
      return;
    }
    const health = await pipeline.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Sync sales endpoint
app.post('/sync/sales', async (req, res): Promise<void> => {
  try {
    if (!pipeline) {
      res.status(503).json({
        success: false,
        error: 'Pipeline not initialized',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    const result = await pipeline.syncSalesData(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'Lightspeed BigQuery Pipeline',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      sync: 'POST /sync/sales',
    },
    documentation: 'See specs/lightspeed-bigquery.spec.yaml',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT) || 8080;
  const HOST = process.env.HOST || '0.0.0.0';
  
  const server = app.listen(PORT, HOST, () => {
    console.log(JSON.stringify({ 
      severity: 'INFO', 
      message: 'Integration service listening', 
      host: HOST, 
      port: PORT 
    }));
  });
  
  // Graceful shutdown handler (Cloud Run sends SIGTERM before killing container)
  const shutdown = (signal: NodeJS.Signals) => {
    console.log(JSON.stringify({ severity: 'INFO', message: `Received ${signal}, shutting down gracefully` }));
    
    server.close((err) => {
      if (err) {
        console.error(JSON.stringify({ severity: 'ERROR', message: 'Shutdown error', error: err.message }));
        process.exit(1);
      }
      console.log(JSON.stringify({ severity: 'INFO', message: 'Shutdown complete' }));
      process.exit(0);
    });
    
    // Force exit after 10s grace period (Cloud Run allows ~10s before SIGKILL)
    setTimeout(() => {
      console.error(JSON.stringify({ severity: 'ERROR', message: 'Forced shutdown after timeout' }));
      process.exit(1);
    }, 10000).unref();
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
