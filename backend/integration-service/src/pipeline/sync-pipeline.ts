/**
 * Lightspeed BigQuery Pipeline
 * Core pipeline logic for syncing sales data
 */

/* eslint-disable no-console */

// import { BigQuery } from '@google-cloud/bigquery'; // TODO: Wire when BigQuery sync active
import { LightspeedClient } from './clients/lightspeed-client';
import { BigQueryClient } from './clients/bigquery-client';
import { DataTransformer } from './transform/transformer';

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
  private lightspeedClient: LightspeedClient;
  private bigqueryClient: BigQueryClient;
  private transformer: DataTransformer;

  constructor() {
    this.lightspeedClient = new LightspeedClient();
    this.bigqueryClient = new BigQueryClient();
    this.transformer = new DataTransformer();
  }

  async syncSalesData(request: SyncRequest = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const since = request.since || new Date(Date.now() - 86400000).toISOString();
    const batchSize = Math.min(request.batch_size || 100, 1000);

    try {
      const sales = await this.lightspeedClient.fetchSales(since, batchSize);
      
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

      const rows = this.transformer.transformSales(sales);
      const insertResult = await this.bigqueryClient.insertRows(rows);
      
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

    try {
      lightspeedConnected = await this.lightspeedClient.isConnected();
    } catch (error) {
      console.warn('Lightspeed health check failed:', error);
    }

    try {
      bigqueryConnected = await this.bigqueryClient.isConnected();
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

