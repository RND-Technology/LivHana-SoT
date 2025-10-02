import { BigQuery } from '@google-cloud/bigquery';

export class BigQueryMemoryAdapter {
  constructor({ logger, projectId, datasetId }) {
    this.logger = logger;
    this.projectId = projectId || process.env.GCP_PROJECT_ID;
    this.datasetId = datasetId || process.env.MEMORY_DATASET_ID || 'customer_memory';
    this.bigquery = new BigQuery({ projectId: this.projectId });
    this.batchQueue = [];
    this.batchSize = Number(process.env.BIGQUERY_BATCH_SIZE ?? 100);
    this.flushInterval = Number(process.env.BIGQUERY_FLUSH_INTERVAL_MS ?? 30000);
    this.flushTimer = null;
  }

  static async create({ logger }) {
    const adapter = new BigQueryMemoryAdapter({ logger });
    await adapter.ensureSchema();
    adapter.startBatchFlusher();
    return adapter;
  }

  async ensureSchema() {
    try {
      const dataset = this.bigquery.dataset(this.datasetId);
      const [exists] = await dataset.exists();

      if (!exists) {
        await this.bigquery.createDataset(this.datasetId, {
          location: 'US',
        });
        this.logger?.info({ datasetId: this.datasetId }, 'Created BigQuery dataset');
      }

      await this.ensureTable('customer_profiles', this.getProfileSchema());
      await this.ensureTable('interactions', this.getInteractionSchema());
      await this.ensureTable('purchases', this.getPurchaseSchema());
      await this.ensureTable('predictions', this.getPredictionSchema());
      await this.ensureTable('audit_logs', this.getAuditLogSchema());

      this.logger?.info('BigQuery memory schema verified');
    } catch (error) {
      this.logger?.error?.({ error: error.message }, 'Failed to ensure BigQuery schema');
      throw error;
    }
  }

  async ensureTable(tableId, schema) {
    const table = this.bigquery.dataset(this.datasetId).table(tableId);
    const [exists] = await table.exists();

    if (!exists) {
      await this.bigquery.dataset(this.datasetId).createTable(tableId, {
        schema: { fields: schema },
        timePartitioning: {
          type: 'DAY',
          field: 'timestamp',
        },
      });
      this.logger?.info({ tableId }, 'Created BigQuery table');
    }
  }

  getProfileSchema() {
    return [
      { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'version', type: 'STRING', mode: 'REQUIRED' },
      { name: 'profile_json', type: 'JSON', mode: 'REQUIRED' },
      { name: 'total_purchases', type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'lifetime_value', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'churn_risk', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'engagement_score', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'last_interaction_date', type: 'TIMESTAMP', mode: 'NULLABLE' },
      { name: 'last_purchase_date', type: 'TIMESTAMP', mode: 'NULLABLE' },
    ];
  }

  getInteractionSchema() {
    return [
      { name: 'interaction_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'session_id', type: 'STRING', mode: 'NULLABLE' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'message', type: 'STRING', mode: 'NULLABLE' },
      { name: 'response', type: 'STRING', mode: 'NULLABLE' },
      { name: 'intent', type: 'STRING', mode: 'NULLABLE' },
      { name: 'sentiment', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'entities', type: 'JSON', mode: 'NULLABLE' },
      { name: 'channel', type: 'STRING', mode: 'NULLABLE' },
      { name: 'engagement_score', type: 'FLOAT', mode: 'NULLABLE' },
    ];
  }

  getPurchaseSchema() {
    return [
      { name: 'order_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'amount', type: 'FLOAT', mode: 'REQUIRED' },
      { name: 'products', type: 'JSON', mode: 'NULLABLE' },
      { name: 'payment_method', type: 'STRING', mode: 'NULLABLE' },
      { name: 'order_size', type: 'INTEGER', mode: 'NULLABLE' },
    ];
  }

  getPredictionSchema() {
    return [
      { name: 'prediction_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'prediction_type', type: 'STRING', mode: 'REQUIRED' },
      { name: 'prediction_value', type: 'JSON', mode: 'REQUIRED' },
      { name: 'confidence', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'actual_value', type: 'JSON', mode: 'NULLABLE' },
      { name: 'accuracy', type: 'FLOAT', mode: 'NULLABLE' },
    ];
  }

  getAuditLogSchema() {
    return [
      { name: 'audit_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'action', type: 'STRING', mode: 'REQUIRED' },
      { name: 'details', type: 'JSON', mode: 'NULLABLE' },
      { name: 'user_agent', type: 'STRING', mode: 'NULLABLE' },
      { name: 'ip_address', type: 'STRING', mode: 'NULLABLE' },
    ];
  }

  async saveProfile(customerId, profile) {
    const row = {
      customer_id: customerId,
      timestamp: new Date().toISOString(),
      version: profile.version || '1.0',
      profile_json: profile,
      total_purchases: profile.behavioral?.totalPurchases || 0,
      lifetime_value: profile.behavioral?.lifetimeValue || 0,
      churn_risk: profile.predictions?.churnRisk || 0,
      engagement_score: profile.communication?.engagement || 0,
      last_interaction_date: profile.conversationHistory?.lastInteractionDate || null,
      last_purchase_date: profile.behavioral?.lastPurchaseDate || null,
    };

    this.addToBatch('customer_profiles', row);
  }

  async saveInteraction(customerId, interaction) {
    const row = {
      interaction_id: interaction.interactionId || this.generateId(),
      customer_id: customerId,
      session_id: interaction.sessionId || null,
      timestamp: interaction.timestamp || new Date().toISOString(),
      message: interaction.message || null,
      response: interaction.response || null,
      intent: interaction.intent || null,
      sentiment: interaction.sentiment || null,
      entities: interaction.entities || null,
      channel: interaction.channel || null,
      engagement_score: interaction.engagementScore || null,
    };

    this.addToBatch('interactions', row);
  }

  async savePurchase(customerId, purchase) {
    const row = {
      order_id: purchase.orderId,
      customer_id: customerId,
      timestamp: purchase.timestamp || new Date().toISOString(),
      amount: purchase.amount,
      products: purchase.products || null,
      payment_method: purchase.paymentMethod || null,
      order_size: purchase.orderSize || purchase.products?.length || 0,
    };

    this.addToBatch('purchases', row);
  }

  async savePrediction(customerId, prediction) {
    const row = {
      prediction_id: prediction.predictionId || this.generateId(),
      customer_id: customerId,
      timestamp: new Date().toISOString(),
      prediction_type: prediction.type,
      prediction_value: prediction.value,
      confidence: prediction.confidence || null,
      actual_value: prediction.actualValue || null,
      accuracy: prediction.accuracy || null,
    };

    this.addToBatch('predictions', row);
  }

  async saveAuditLog(customerId, auditLog) {
    const row = {
      audit_id: auditLog.auditId || this.generateId(),
      customer_id: customerId,
      timestamp: auditLog.timestamp || new Date().toISOString(),
      action: auditLog.action,
      details: auditLog.details || null,
      user_agent: auditLog.userAgent || null,
      ip_address: auditLog.ipAddress || null,
    };

    this.addToBatch('audit_logs', row);
  }

  addToBatch(tableId, row) {
    this.batchQueue.push({ tableId, row });

    if (this.batchQueue.length >= this.batchSize) {
      this.flushBatch();
    }
  }

  async flushBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    const tableGroups = {};
    batch.forEach(({ tableId, row }) => {
      if (!tableGroups[tableId]) {
        tableGroups[tableId] = [];
      }
      tableGroups[tableId].push(row);
    });

    const insertPromises = Object.entries(tableGroups).map(([tableId, rows]) =>
      this.insertRows(tableId, rows)
    );

    try {
      await Promise.all(insertPromises);
      this.logger?.info({ rowCount: batch.length }, 'Flushed batch to BigQuery');
    } catch (error) {
      this.logger?.error?.({ error: error.message, rowCount: batch.length }, 'Failed to flush batch');
      this.batchQueue.unshift(...batch);
    }
  }

  async insertRows(tableId, rows) {
    try {
      await this.bigquery
        .dataset(this.datasetId)
        .table(tableId)
        .insert(rows, {
          skipInvalidRows: false,
          ignoreUnknownValues: true,
        });
    } catch (error) {
      this.logger?.error?.(
        { error: error.message, tableId, rowCount: rows.length },
        'BigQuery insert failed'
      );
      throw error;
    }
  }

  startBatchFlusher() {
    this.flushTimer = setInterval(() => {
      this.flushBatch();
    }, this.flushInterval);
  }

  stopBatchFlusher() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  async queryProfile(customerId) {
    const query = `
      SELECT *
      FROM \`${this.projectId}.${this.datasetId}.customer_profiles\`
      WHERE customer_id = @customerId
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId },
      });
      return rows.length > 0 ? rows[0].profile_json : null;
    } catch (error) {
      this.logger?.error?.({ error: error.message, customerId }, 'Failed to query profile');
      return null;
    }
  }

  async queryInteractionHistory(customerId, options = {}) {
    const { limit = 100, startDate = null, endDate = null } = options;

    let query = `
      SELECT *
      FROM \`${this.projectId}.${this.datasetId}.interactions\`
      WHERE customer_id = @customerId
    `;

    const params = { customerId, limit };

    if (startDate) {
      query += ` AND timestamp >= @startDate`;
      params.startDate = startDate;
    }

    if (endDate) {
      query += ` AND timestamp <= @endDate`;
      params.endDate = endDate;
    }

    query += ` ORDER BY timestamp DESC LIMIT @limit`;

    try {
      const [rows] = await this.bigquery.query({ query, params });
      return rows;
    } catch (error) {
      this.logger?.error?.({ error: error.message, customerId }, 'Failed to query interactions');
      return [];
    }
  }

  async queryCustomerLifetimeValue(customerId) {
    const query = `
      SELECT
        SUM(amount) as total_spent,
        COUNT(*) as order_count,
        AVG(amount) as avg_order_value,
        MIN(timestamp) as first_purchase,
        MAX(timestamp) as last_purchase
      FROM \`${this.projectId}.${this.datasetId}.purchases\`
      WHERE customer_id = @customerId
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId },
      });
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      this.logger?.error?.({ error: error.message, customerId }, 'Failed to query LTV');
      return null;
    }
  }

  async queryChurnRiskCohort(riskThreshold = 0.7) {
    const query = `
      SELECT
        customer_id,
        churn_risk,
        last_interaction_date,
        last_purchase_date,
        lifetime_value
      FROM \`${this.projectId}.${this.datasetId}.customer_profiles\`
      WHERE churn_risk >= @riskThreshold
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      ORDER BY churn_risk DESC, lifetime_value DESC
      LIMIT 100
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { riskThreshold },
      });
      return rows;
    } catch (error) {
      this.logger?.error?.({ error: error.message }, 'Failed to query churn cohort');
      return [];
    }
  }

  async aggregateInsights(startDate, endDate) {
    const query = `
      SELECT
        DATE(timestamp) as date,
        COUNT(DISTINCT customer_id) as active_customers,
        COUNT(*) as total_interactions,
        AVG(engagement_score) as avg_engagement,
        AVG(sentiment) as avg_sentiment
      FROM \`${this.projectId}.${this.datasetId}.interactions\`
      WHERE timestamp BETWEEN @startDate AND @endDate
      GROUP BY date
      ORDER BY date DESC
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { startDate, endDate },
      });
      return rows;
    } catch (error) {
      this.logger?.error?.({ error: error.message }, 'Failed to aggregate insights');
      return [];
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async close() {
    this.stopBatchFlusher();
    await this.flushBatch();
  }
}
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
