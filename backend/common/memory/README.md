# Memory Learning System

> **Make Liv Hana remember EVERYTHING and get smarter with every interaction.**

## Overview

This is the core AI memory learning system for Liv Hana. It provides:

- **Customer Intelligence**: Comprehensive customer profiles with preferences, behavior, and history
- **Predictive Analytics**: Next purchase prediction, churn risk detection
- **Semantic Search**: Vector-based product and conversation search
- **Persistent Storage**: BigQuery integration for historical analytics
- **Privacy First**: Encryption, GDPR compliance, audit logging

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Memory Learning System                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Learning   │  │   BigQuery   │  │   Vector     │      │
│  │   Engine     │  │   Adapter    │  │   Embeddings │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                      ┌────▼─────┐                           │
│                      │  Redis   │                           │
│                      └──────────┘                           │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
    ┌────▼─────┐      ┌──────▼──────┐      ┌─────▼─────┐
    │ Reasoning │      │    Voice    │      │Integration│
    │  Gateway  │      │   Service   │      │  Service  │
    └───────────┘      └─────────────┘      └───────────┘
```

## Core Components

### 1. Learning Engine (`learning-engine.js`)

The heart of the system. Manages customer profiles, learns from interactions, and generates predictions.

**Key Features:**
- Customer profile creation and updates
- Interaction learning with topic extraction
- Purchase history tracking
- Churn risk calculation
- Next purchase prediction
- Recommendation generation
- Session and context management
- Privacy and compliance (encryption, audit logs)

**Example:**
```javascript
import { MemoryLearningEngine } from './learning-engine.js';

const engine = await MemoryLearningEngine.create({ logger });

// Learn from interaction
await engine.learnFromInteraction('customer-123', {
  message: "I need something for sleep",
  response: "Try Indica strains",
  sentiment: 0.8
});

// Get profile
const profile = await engine.getProfile('customer-123');

// Get predictions
const churnRisk = await engine.calculateChurnRisk('customer-123');
const nextPurchase = await engine.predictNextPurchase('customer-123');
```

### 2. BigQuery Adapter (`bigquery-adapter.js`)

Persistent storage and analytics engine. Stores all historical data in BigQuery for long-term analysis.

**Key Features:**
- Automatic schema creation
- Batch processing (100 rows or 30s interval)
- Customer profiles, interactions, purchases, predictions
- Advanced analytics queries
- Churn cohort analysis
- Customer lifetime value calculation

**Example:**
```javascript
import { BigQueryMemoryAdapter } from './bigquery-adapter.js';

const adapter = await BigQueryMemoryAdapter.create({ logger });

// Save profile (batched)
await adapter.saveProfile('customer-123', profile);

// Query LTV
const ltv = await adapter.queryCustomerLifetimeValue('customer-123');

// Find at-risk customers
const churnCohort = await adapter.queryChurnRiskCohort(0.7);
```

### 3. Vector Embeddings (`vector-embeddings.js`)

Semantic search powered by OpenAI embeddings and Redis vector indexes.

**Key Features:**
- Product embedding generation and storage
- Conversation embedding and similarity search
- Semantic product recommendations
- Context-aware conversation retrieval
- Efficient caching

**Example:**
```javascript
import { VectorEmbeddingService } from './vector-embeddings.js';

const vectorService = await VectorEmbeddingService.create({ logger });

// Index product
await vectorService.storeProductEmbedding({
  productId: 'prod-123',
  name: 'Blue Dream',
  description: 'Uplifting hybrid strain',
  strain: 'Hybrid',
  effects: ['uplifting', 'creative']
});

// Search semantically
const results = await vectorService.findSimilarProducts(
  "something energizing for focus",
  { limit: 10, minScore: 0.7 }
);
```

### 4. Memory Store (`store.js`)

Legacy memory store for job history and session data. Still used by reasoning worker.

## Customer Profile Schema

```javascript
{
  customerId: "customer-123",
  version: "1.0",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",

  // Preferences
  preferences: {
    strains: [{ value: "Blue Dream", weight: 10 }],
    products: [{ value: "Flower", weight: 8 }],
    budget: { min: 50, max: 200 },
    effects: [{ value: "relaxing", weight: 7 }],
    flavors: [{ value: "citrus", weight: 5 }],
    consumptionMethods: ["flower", "vape"]
  },

  // Behavioral
  behavioral: {
    purchaseFrequency: 30,  // days
    averageOrderValue: 120.00,
    preferredTimeOfDay: [{ value: "evening", weight: 8 }],
    orderSizes: [{ value: "medium", weight: 6 }],
    lastPurchaseDate: "2025-01-10T00:00:00Z",
    totalPurchases: 15,
    lifetimeValue: 1800.00
  },

  // Medical
  medical: {
    conditions: ["anxiety", "insomnia"],
    symptoms: ["sleep", "stress"],
    effectivenessRatings: {
      "Blue Dream": 0.9,
      "OG Kush": 0.8
    }
  },

  // Communication
  communication: {
    style: "casual",
    preferredChannel: "voice",
    responseTime: [30, 45, 60],
    engagement: 0.85,
    sentiment: 0.7
  },

  // Conversation History
  conversationHistory: {
    totalInteractions: 42,
    topics: { "strain": 15, "effect": 12, "price": 8 },
    questions: [
      { question: "What helps with sleep?", timestamp: "..." }
    ],
    recommendations: ["Blue Dream", "Granddaddy Purple"],
    lastInteractionDate: "2025-01-15T10:00:00Z"
  },

  // Predictions
  predictions: {
    nextPurchaseDate: "2025-02-10T00:00:00Z",
    nextPurchaseConfidence: 0.85,
    churnRisk: 0.12,
    recommendedProducts: ["Blue Dream", "OG Kush"]
  },

  // Metadata
  metadata: {
    dataRetentionUntil: "2032-01-01T00:00:00Z",
    consentGiven: true,
    lastAuditDate: "2025-01-15T00:00:00Z"
  }
}
```

## Files

- `learning-engine.js` - Core memory learning engine
- `learning-engine.test.js` - Comprehensive test suite
- `bigquery-adapter.js` - BigQuery integration
- `vector-embeddings.js` - Vector search with OpenAI
- `store.js` - Legacy memory store (job history)
- `store.test.js` - Memory store tests
- `README.md` - This file

## API Integration

The memory system is exposed via REST API in `backend/reasoning-gateway/src/routes/memory.js`:

- `POST /api/memory/learn` - Record interaction
- `GET /api/memory/context/:customerId` - Get context
- `POST /api/memory/predict/:customerId` - Get predictions
- `POST /api/memory/purchase/:customerId` - Record purchase
- `DELETE /api/memory/forget/:customerId` - GDPR deletion
- `GET /api/memory/profile/:customerId` - Get profile
- `POST /api/memory/vector/search` - Semantic search
- `POST /api/memory/vector/product` - Index product
- `GET /api/memory/analytics/*` - Analytics endpoints

## Configuration

### Required
```bash
ENABLE_MEMORY_LEARNING=true
MEMORY_REDIS_URL=redis://localhost:6379
MEMORY_ENCRYPTION_KEY=your-64-char-hex-key
```

### Optional (BigQuery)
```bash
ENABLE_BIGQUERY_MEMORY=true
GCP_PROJECT_ID=your-project
MEMORY_DATASET_ID=customer_memory
BIGQUERY_BATCH_SIZE=100
BIGQUERY_FLUSH_INTERVAL_MS=30000
```

### Optional (Vector Search)
```bash
ENABLE_VECTOR_EMBEDDINGS=true
OPENAI_API_KEY=your-openai-key
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
```

## Testing

```bash
npm test memory/learning-engine.test.js
npm test memory/store.test.js
```

## Performance

- **Profile Retrieval**: < 10ms (cached), < 50ms (Redis)
- **Learning Operation**: < 100ms (async)
- **Vector Search**: < 100ms (top 10)
- **BigQuery Batch**: < 1s (100 rows)

## Privacy & Compliance

- **Encryption**: AES-256-GCM for sensitive data
- **GDPR**: Right to be forgotten via `/forget` endpoint
- **Retention**: 7 years (cannabis compliance)
- **Audit Logs**: All operations logged

## Documentation

- Full Documentation: `/docs/MEMORY_LEARNING_SYSTEM.md`
- Quick Start: `/docs/MEMORY_QUICK_START.md`
- API Reference: See full documentation

## Support

For questions or issues, contact the technical team or refer to the documentation.

---

**THIS IS WHAT MAKES US A UNICORN - NO COMPETITOR HAS THIS.**
