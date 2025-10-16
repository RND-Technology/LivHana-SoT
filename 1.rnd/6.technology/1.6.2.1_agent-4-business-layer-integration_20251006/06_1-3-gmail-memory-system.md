### 1.3 Gmail → Memory System

```
┌─────────────────────────────────────────────────────────────┐
│              GMAIL → MEMORY LEARNING PIPELINE                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Gmail API   │         │    Webhook   │         │   Memory     │
│   (OAuth2)   │────────▶│   Handler    │────────▶│   Engine     │
│              │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │ Pub/Sub Push           │ Extract context         │
       │ New email event        │ Sentiment analysis      │ BigQuery
       │                        │ Entity extraction       │ customer_memory
       │                        │                         │ dataset
       ▼                        ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│  LEARNING FEATURES:                                           │
│  - Customer interaction tracking                             │
│  - Sentiment scoring (-1 to +1)                              │
│  - Intent classification                                     │
│  - Entity extraction (products, issues, preferences)         │
│  - Session continuity tracking                               │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   AI Agent   │         │   Context    │         │   Vector     │
│   Request    │────────▶│   Enrichment │◀───────▶│  Embeddings  │
└──────────────┘         └──────────────┘         └──────────────┘
                                 │
                         Retrieve history
                         Calculate predictions
                         Generate recommendations
```

**Implementation:**

- **Memory Router:** `/backend/reasoning-gateway/src/routes/memory.js`
- **Learning Engine:** `/backend/common/memory/learning-engine.js`
- **BigQuery Adapter:** `/backend/common/memory/bigquery-adapter.js`
- **Vector Service:** `/backend/common/memory/vector-embeddings.js`

**Memory Data Models:**

```javascript
// customer_profiles schema
{
  customer_id: STRING (REQUIRED),
  timestamp: TIMESTAMP (REQUIRED),
  version: STRING (REQUIRED, e.g., "1.0"),
  profile_json: JSON (REQUIRED, full profile),
  total_purchases: INTEGER,
  lifetime_value: FLOAT,
  churn_risk: FLOAT (0-1),
  engagement_score: FLOAT (0-1),
  last_interaction_date: TIMESTAMP,
  last_purchase_date: TIMESTAMP
}

// interactions schema
{
  interaction_id: STRING (UUID),
  customer_id: STRING,
  session_id: STRING,
  timestamp: TIMESTAMP,
  message: STRING (customer message),
  response: STRING (AI response),
  intent: STRING (classified intent),
  sentiment: FLOAT (-1 to +1),
  entities: JSON (extracted entities),
  channel: STRING (email, voice, chat),
  engagement_score: FLOAT
}

// purchases schema
{
  order_id: STRING,
  customer_id: STRING,
  timestamp: TIMESTAMP,
  amount: FLOAT,
  products: JSON (array of product IDs),
  payment_method: STRING,
  order_size: INTEGER (number of items)
}

// predictions schema
{
  prediction_id: STRING (UUID),
  customer_id: STRING,
  timestamp: TIMESTAMP,
  prediction_type: STRING (next-purchase, churn-risk, recommendations),
  prediction_value: JSON,
  confidence: FLOAT (0-1),
  actual_value: JSON (for accuracy tracking),
  accuracy: FLOAT (post-validation)
}
```

**API Endpoints:**

- `POST /api/memory/learn` - Record interaction
- `GET /api/memory/context/:customerId` - Get enriched context
- `POST /api/memory/predict/:customerId` - Generate predictions
- `POST /api/memory/purchase/:customerId` - Record purchase
- `GET /api/memory/profile/:customerId` - Get customer profile
- `DELETE /api/memory/forget/:customerId` - GDPR compliance

**Context Enrichment Flow:**

```javascript
// Example: AI agent requests customer context
const context = await memoryEngine.getContext(customerId, {
  depth: 'full',
  includeRecommendations: true,
  currentMessage: 'What do you recommend for sleep?'
});

// Returns enriched context:
{
  profile: {
    totalPurchases: 12,
    lifetimeValue: 456.78,
    preferredCategories: ['Flower', 'Edibles'],
    communicationStyle: 'detailed',
    engagement: 0.85
  },
  recentInteractions: [...], // Last 10 interactions
  predictions: {
    churnRisk: 0.12,
    nextPurchaseDate: '2025-10-15',
    recommendedProducts: ['OG Kush', 'Sleep Gummies']
  },
  vectorContext: {
    relevantConversations: [...], // Semantic search results
    relevantProducts: [...]
  }
}
```

**Critical Integration Points:**

1. **Enable Features:** `ENABLE_BIGQUERY_MEMORY=true`, `ENABLE_VECTOR_EMBEDDINGS=true`
2. **BigQuery Project:** `GCP_PROJECT_ID`, `MEMORY_DATASET_ID`
3. **Batch Processing:** `BIGQUERY_BATCH_SIZE=100`, `BIGQUERY_FLUSH_INTERVAL_MS=30000`
4. **Authentication:** JWT token via `authMiddleware`

---
