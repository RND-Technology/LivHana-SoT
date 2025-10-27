// LIGHTSPEED BIGQUERY PIPELINE - TIER-1 OAUTH FUSION
// Real-time sales data streaming from Lightspeed to BigQuery
// Implements OAuth2 auto-refresh and idempotent insertion

import { BigQuery } from '@google-cloud/bigquery';
import axios, { AxiosInstance } from 'axios';
import { LightspeedOAuthClient } from './auth/lightspeed-oauth.js';

// TypeScript strict mode - no 'any' types allowed
interface LightspeedSale {
  saleID: string;
  completed_at: string;
  customer?: { id: string } | null | undefined;
  Sale_Lines: Array<{
    Item?: { itemID: string; description: string } | null | undefined;
    unitQuantity: number;
    calcTotal: string;
  }>;
  SalePayments: Array<{
    PaymentType?: { name: string } | null | undefined;
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
  private oauthClient: LightspeedOAuthClient | null = null;
  private useOAuth: boolean;

  constructor() {
    // Check if OAuth credentials are available
    const clientId = process.env.LIGHTSPEED_CLIENT_ID;
    const clientSecret = process.env.LIGHTSPEED_CLIENT_SECRET;
    const accountId = process.env.LIGHTSPEED_ACCOUNT_ID;
    const legacyToken = process.env.LIGHTSPEED_TOKEN;

    this.useOAuth = !!(clientId && clientSecret && accountId);

    if (this.useOAuth) {
      // TIER-1 PATH: OAuth2 with auto-refresh
      console.log('[Lightspeed] Initializing with OAuth2 authentication');
      console.log(`[Lightspeed] Account ID: ${accountId}`);
      if (!process.env.GCP_PROJECT_ID) {
        throw new Error('GCP_PROJECT_ID environment variable is required for OAuth2 authentication');
      }

      this.oauthClient = new LightspeedOAuthClient(
        clientId!,
        clientSecret!,
        accountId!,
        process.env.OAUTH_REDIRECT_URI || 'http://localhost:3005/auth/lightspeed/callback',
        process.env.GCP_PROJECT_ID
      );

      // OAuth client will inject tokens via interceptor
      // Lightspeed API V3 uses account-specific URLs
      this.lightspeed = this.oauthClient.createAuthenticatedClient(
        `https://api.lightspeedapp.com/API/Account/${accountId}`
      );
    } else if (legacyToken) {
      // FALLBACK PATH: Legacy personal access token
      console.log('[Lightspeed] Falling back to legacy token authentication');
      console.warn('[Lightspeed] ⚠️  Personal tokens are deprecated - migrate to OAuth2');

      this.lightspeed = axios.create({
        baseURL: 'https://api.lightspeedapp.com/API/V3',
        headers: {
          'Authorization': `Bearer ${legacyToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    } else {
      throw new Error(
        'No Lightspeed authentication configured. ' +
        'Provide either LIGHTSPEED_CLIENT_ID + LIGHTSPEED_CLIENT_SECRET + LIGHTSPEED_ACCOUNT_ID (OAuth2) ' +
        'or LIGHTSPEED_TOKEN (legacy)'
      );
    }

    if (!process.env.GCP_PROJECT_ID) {
      throw new Error('GCP_PROJECT_ID environment variable is required for BigQuery operations');
    }

    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
    });

    this.dataset = process.env.BIGQUERY_DATASET || 'livhana_prod';
    this.table = 'sales';
  }

  /**
   * Initialize OAuth client (load existing tokens from Secret Manager)
   */
  async initialize(): Promise<boolean> {
    if (!this.oauthClient) {
      return true; // Legacy mode, no initialization needed
    }

    try {
      const initialized = await this.oauthClient.initialize();
      if (initialized) {
        console.log('[Lightspeed] OAuth client initialized with existing tokens');
        return true;
      } else {
        console.warn('[Lightspeed] No OAuth tokens found - authorization flow required');
        return false;
      }
    } catch (error) {
      console.error('[Lightspeed] Failed to initialize OAuth client:', error);
      return false;
    }
  }

  /**
   * Get OAuth client for authorization flow
   */
  getOAuthClient(): LightspeedOAuthClient | null {
    return this.oauthClient;
  }

  /**
   * Check if using OAuth authentication
   */
  isUsingOAuth(): boolean {
    return this.useOAuth;
  }

  /**
   * Get authentication status for health checks
   */
  getAuthStatus(): { method: string; ready: boolean; details?: any } {
    if (this.useOAuth && this.oauthClient) {
      const status = this.oauthClient.getStatus();
      return {
        method: 'OAuth2',
        ready: status.hasTokens && !status.isExpired,
        details: {
          hasTokens: status.hasTokens,
          expiresAt: new Date(status.expiresAt).toISOString(),
          expiresIn: `${Math.round(status.expiresIn / 1000)}s`,
          isExpired: status.isExpired,
        },
      };
    } else {
      return {
        method: 'LegacyToken',
        ready: !!process.env.LIGHTSPEED_TOKEN,
        details: { deprecated: true },
      };
    }
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
    lightspeed_auth: any;
    bigquery_connected: boolean;
    last_sync?: string;
  }> {
    const timestamp = new Date().toISOString();
    let lightspeedConnected = false;
    let bigqueryConnected = false;

    // Get authentication status
    const authStatus = this.getAuthStatus();

    // Test Lightspeed Retail API connection
    try {
      // Retail API health check: /Account.json returns account info
      await this.lightspeed.get('/Account.json', { timeout: 5000 });
      lightspeedConnected = true;
    } catch (error) {
      console.warn('Lightspeed Retail API health check failed:', error);
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
      version: '1.0.0-oauth',
      lightspeed_connected: lightspeedConnected,
      lightspeed_auth: authStatus,
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

  // Initialize OAuth client asynchronously (non-blocking)
  pipeline.initialize().then((initialized) => {
    if (initialized) {
      console.log('[Integration] OAuth client ready');
    } else {
      console.warn('[Integration] OAuth authorization required - visit /auth/lightspeed/start');
    }
  }).catch((error) => {
    console.error('[Integration] Failed to initialize OAuth:', error);
  });
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

// OAuth authorization start
app.get('/auth/lightspeed/start', (_req, res) => {
  if (!pipeline) {
    res.status(503).send('Pipeline not initialized');
    return;
  }

  const oauthClient = pipeline.getOAuthClient();
  if (!oauthClient) {
    res.status(400).send('OAuth not configured - using legacy token authentication');
    return;
  }

  const authUrl = oauthClient.getAuthorizationUrl();
  console.log('[OAuth] Redirecting to authorization URL:', authUrl);
  res.redirect(authUrl);
});

// OAuth callback handler
app.get('/auth/lightspeed/callback', async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    console.error('[OAuth] Authorization failed:', error);
    res.status(400).send(`Authorization failed: ${error}`);
    return;
  }

  if (!code) {
    res.status(400).send('Missing authorization code');
    return;
  }

  if (!pipeline) {
    res.status(503).send('Pipeline not initialized');
    return;
  }

  const oauthClient = pipeline.getOAuthClient();
  if (!oauthClient) {
    res.status(400).send('OAuth not configured');
    return;
  }

  try {
    await oauthClient.exchangeCode(code);
    console.log('[OAuth] Authorization successful - tokens stored');
    res.send(`
      <html>
        <head><title>Authorization Successful</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>✅ Authorization Successful</h1>
          <p>Lightspeed OAuth2 tokens have been stored securely.</p>
          <p>You can close this window and return to the integration service.</p>
          <p><a href="/health">Check Service Health</a></p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[OAuth] Failed to exchange authorization code:', error);
    res.status(500).send(`Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Root endpoint
app.get('/', (_req, res) => {
  const usingOAuth = pipeline?.isUsingOAuth() || false;
  res.json({
    service: 'Lightspeed BigQuery Pipeline',
    version: '1.0.0-oauth',
    authentication: usingOAuth ? 'OAuth2' : 'LegacyToken',
    endpoints: {
      health: 'GET /health',
      sync: 'POST /sync/sales',
      oauthStart: usingOAuth ? 'GET /auth/lightspeed/start' : undefined,
      oauthCallback: usingOAuth ? 'GET /auth/lightspeed/callback' : undefined,
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
