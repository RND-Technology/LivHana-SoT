### 3.3 BigQuery Schema Consistency

**Dataset Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│              BIGQUERY DATASET ORGANIZATION                    │
└─────────────────────────────────────────────────────────────┘

GCP_PROJECT_ID (e.g., "livhana-production")
├── commerce (BQ_DATASET)
│   ├── square_payments
│   ├── square_items
│   ├── memberships
│   ├── raffles
│   ├── raffle_tickets
│   └── raffle_transactions
│
├── analytics (LIGHTSPEED_BQ_DATASET)
│   ├── lightspeed_transactions
│   └── lightspeed_products
│
└── customer_memory (MEMORY_DATASET_ID)
    ├── customer_profiles
    ├── interactions
    ├── purchases
    ├── predictions
    └── audit_logs
```

**Schema Versioning:**

```javascript
// All tables include versioning metadata
{
  // Data fields...
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  version: STRING, // Schema version (e.g., "1.0", "1.1")
  _partition_date: DATE // Auto-partitioned by day
}
```

**Schema Migration Strategy:**

```javascript
// Step 1: Check if table exists
const [exists] = await tableRef.exists();

if (!exists) {
  // Create new table with latest schema
  await tableRef.create({
    schema: { fields: schemaV1_1 },
    location: LOCATION,
    timePartitioning: {
      type: 'DAY',
      field: 'created_at' // Partition by creation date
    }
  });
}

// Step 2: For existing tables, use ALTER TABLE (manual)
// BigQuery doesn't support automatic schema evolution
// Safe changes: Add nullable columns, widen types (INT64 → FLOAT64)
// Breaking changes: Require data migration
```

**Time Partitioning:**

```javascript
// All event tables partitioned by day
timePartitioning: {
  type: 'DAY',
  field: 'created_at', // or 'timestamp'
  expirationMs: null // No auto-deletion (compliance requires 7 years)
}

// Query benefits:
// - Reduced cost (only scan relevant partitions)
// - Faster queries (fewer rows scanned)
// - Automatic partition pruning

// Example: Query last 30 days only
WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
```

**Schema Consistency Checks:**

**File:** `/backend/integration-service/scripts/setup-bigquery-schema.js`

```javascript
async function ensureSchemaConsistency() {
  const datasets = ['commerce', 'analytics', 'customer_memory'];

  for (const datasetId of datasets) {
    const dataset = bigquery.dataset(datasetId);
    const [exists] = await dataset.exists();

    if (!exists) {
      console.log(`Creating dataset: ${datasetId}`);
      await bigquery.createDataset(datasetId, { location: 'US' });
    }

    // Validate each table schema
    const tables = await getExpectedTables(datasetId);
    for (const { name, schema } of tables) {
      await ensureTableSchema(datasetId, name, schema);
    }
  }

  console.log('Schema consistency verified');
}

async function ensureTableSchema(datasetId, tableName, expectedSchema) {
  const table = bigquery.dataset(datasetId).table(tableName);
  const [exists] = await table.exists();

  if (!exists) {
    // Create table with expected schema
    await table.create({
      schema: { fields: expectedSchema },
      location: 'US',
      timePartitioning: { type: 'DAY', field: 'created_at' }
    });
    console.log(`Created table: ${datasetId}.${tableName}`);
    return;
  }

  // Validate existing schema
  const [metadata] = await table.getMetadata();
  const actualFields = metadata.schema.fields.map(f => f.name);
  const expectedFields = expectedSchema.map(f => f.name);

  const missingFields = expectedFields.filter(f => !actualFields.includes(f));

  if (missingFields.length > 0) {
    console.warn(`Missing fields in ${datasetId}.${tableName}:`, missingFields);
    // In production: trigger alert, don't auto-migrate
  }
}
```

**Cross-Service Schema Contracts:**

```javascript
// integration-service expects:
// - commerce.square_payments (id, amount, customer_id, created_at)
// - commerce.square_items (id, name, price, category, updated_at)

// reasoning-gateway expects:
// - customer_memory.customer_profiles (customer_id, profile_json, timestamp)
// - customer_memory.interactions (interaction_id, customer_id, message, response)

// Shared schema definitions in common/schemas/ (future improvement)
```

**Data Consistency Guarantees:**

1. **Atomic Writes:** BigQuery insert is atomic per batch (all or nothing)
2. **Idempotency:** Use unique IDs (UUID, timestamp+random) to prevent duplicates
3. **Schema Validation:** BigQuery rejects rows that don't match schema
4. **Insert Options:**
   - `skipInvalidRows: true` → Continue on invalid rows (log errors)
   - `ignoreUnknownValues: true` → Ignore extra fields not in schema

**Schema Documentation:**

| Table | Purpose | Retention | Partitioned | Critical Fields |
|-------|---------|-----------|-------------|----------------|
| square_payments | Payment transactions from Square POS | 7 years | Yes (created_at) | id, amount, customer_id, status |
| square_items | Product catalog from Square | Latest only | No | id, name, price, available |
| memberships | Active + historical memberships | 7 years | Yes (created_at) | id, customer_id, tier, status, next_billing_date |
| raffles | Raffle events (Blue Dream $250K) | 7 years | Yes (created_at) | id, prize, max_tickets, winner_id, draw_timestamp |
| raffle_tickets | Individual ticket purchases | 7 years | Yes (purchase_date) | id, raffle_id, customer_id, ticket_number, is_winner |
| customer_profiles | Customer memory profiles | 2 years | Yes (timestamp) | customer_id, profile_json, churn_risk, lifetime_value |
| interactions | Customer conversation history | 2 years | Yes (timestamp) | interaction_id, customer_id, message, sentiment, intent |

---
