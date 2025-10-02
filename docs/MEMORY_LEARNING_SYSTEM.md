# Liv Hana AI Memory Learning System

## Overview

The Memory Learning System is an advanced AI-powered customer intelligence platform that makes Liv Hana remember EVERYTHING and get smarter with every interaction. This system transforms customer interactions into actionable insights, personalized recommendations, and predictive analytics.

**THIS IS WHAT MAKES US A UNICORN - NO COMPETITOR HAS THIS.**

## Architecture

### Core Components

1. **Memory Learning Engine** (`backend/common/memory/learning-engine.js`)
   - Customer profile management
   - Interaction learning and insight extraction
   - Behavioral pattern analysis
   - Prediction algorithms (next purchase, churn risk)
   - Context management (session, short-term, long-term)

2. **BigQuery Adapter** (`backend/common/memory/bigquery-adapter.js`)
   - Persistent storage for customer profiles
   - Historical interaction data warehouse
   - Purchase history analytics
   - Batch processing for efficiency
   - Advanced querying and aggregations

3. **Vector Embedding Service** (`backend/common/memory/vector-embeddings.js`)
   - Semantic search for products and conversations
   - OpenAI embeddings (text-embedding-3-small)
   - Redis vector indexes
   - Context-aware recommendations

4. **Memory API Routes** (`backend/reasoning-gateway/src/routes/memory.js`)
   - RESTful API for memory operations
   - Authenticated endpoints
   - Real-time learning and context retrieval
   - Analytics and predictions

## Customer Memory Profile

Each customer has a comprehensive profile that tracks:

### 1. Preferences
- **Strains**: Weighted list of preferred strains (Blue Dream, OG Kush, etc.)
- **Products**: Purchase history by product type
- **Budget**: Min/max spending range and average order value
- **Effects**: Desired effects (relaxing, energizing, sleep, focus)
- **Flavors**: Taste preferences
- **Consumption Methods**: Flower, edibles, concentrates, vapes

### 2. Behavioral Patterns
- **Purchase Frequency**: Days between purchases
- **Average Order Value**: Typical spending per order
- **Preferred Time of Day**: Morning, afternoon, evening, night
- **Order Sizes**: Small, medium, large orders
- **Last Purchase Date**: Most recent transaction
- **Total Purchases**: Lifetime order count
- **Lifetime Value**: Total revenue from customer

### 3. Medical Needs (if disclosed)
- **Conditions**: Medical conditions (anxiety, chronic pain, insomnia)
- **Symptoms**: Specific symptoms seeking relief
- **Effectiveness Ratings**: What works for them

### 4. Communication Style
- **Style**: Formal vs casual tone preference
- **Preferred Channel**: Voice, chat, email
- **Response Time**: Engagement patterns
- **Engagement Score**: 0-1 scale of interaction quality
- **Sentiment**: Overall sentiment (-1 to 1)

### 5. Conversation History
- **Total Interactions**: Lifetime conversation count
- **Topics**: Frequency map of discussed topics
- **Questions**: Recent questions asked (last 50)
- **Recommendations**: Products recommended
- **Last Interaction Date**: Most recent conversation

### 6. Predictions
- **Next Purchase Date**: ML prediction with confidence score
- **Next Purchase Confidence**: 0-1 probability
- **Churn Risk**: 0-1 probability of customer leaving
- **Recommended Products**: AI-generated suggestions

## API Endpoints

### Learning & Context

#### POST /api/memory/learn
Record and learn from a customer interaction.

**Request:**
```json
{
  "customerId": "customer-123",
  "interaction": {
    "message": "I need something for sleep and anxiety",
    "response": "I recommend Indica strains like Granddaddy Purple",
    "sentiment": 0.8,
    "intent": "product_recommendation",
    "entities": {
      "strains": ["Indica"],
      "symptoms": ["sleep", "anxiety"]
    },
    "sessionId": "session-456",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "interactionId": "uuid",
  "profile": {
    "totalInteractions": 15,
    "engagement": 0.85,
    "churnRisk": 0.12
  }
}
```

#### GET /api/memory/context/:customerId
Retrieve comprehensive customer context.

**Query Parameters:**
- `sessionId` (optional): Include session context
- `depth` (optional): `summary` | `full` (default: `summary`)
- `includeRecommendations` (optional): `true` | `false`
- `currentMessage` (optional): Current message for vector context

**Response:**
```json
{
  "customerId": "customer-123",
  "preferences": {
    "strains": [
      { "value": "Blue Dream", "weight": 10 },
      { "value": "OG Kush", "weight": 8 }
    ],
    "effects": [
      { "value": "relaxing", "weight": 7 }
    ]
  },
  "recentTopics": ["strain", "effect", "price"],
  "lastInteraction": "2025-01-15T10:00:00Z",
  "churnRisk": 0.15,
  "session": { /* session data */ },
  "vectorContext": {
    "relevantProducts": [ /* similar products */ ],
    "similarConversations": [ /* past conversations */ ],
    "synthesizedContext": "Relevant products: Blue Dream (Sativa)..."
  }
}
```

### Predictions

#### POST /api/memory/predict/:customerId
Generate predictions for customer behavior.

**Request:**
```json
{
  "predictionType": "all"  // or "next-purchase", "churn-risk", "recommendations"
}
```

**Response:**
```json
{
  "customerId": "customer-123",
  "predictions": {
    "nextPurchase": {
      "nextPurchaseDate": "2025-02-15T00:00:00Z",
      "confidence": 0.85,
      "daysSinceLastPurchase": 25,
      "averageFrequency": 30
    },
    "churnRisk": {
      "churnRisk": 0.15,
      "daysSinceLastPurchase": 25,
      "daysSinceLastInteraction": 2,
      "engagement": 0.85,
      "sentiment": 0.7
    },
    "recommendations": [
      {
        "type": "strain",
        "values": ["Blue Dream", "OG Kush", "Sour Diesel"],
        "reason": "Based on your past preferences",
        "confidence": 0.8
      }
    ]
  }
}
```

### Purchase Tracking

#### POST /api/memory/purchase/:customerId
Record a customer purchase.

**Request:**
```json
{
  "purchase": {
    "orderId": "order-789",
    "amount": 150.00,
    "products": [
      {
        "productId": "prod-123",
        "name": "Blue Dream",
        "strain": "Sativa",
        "quantity": 2
      }
    ],
    "paymentMethod": "credit_card",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "lifetimeValue": 1250.00,
  "totalPurchases": 8
}
```

### Profile Management

#### GET /api/memory/profile/:customerId
Retrieve full customer profile.

**Response:**
```json
{
  "customerId": "customer-123",
  "profile": { /* complete profile object */ },
  "lastUpdated": "2025-01-15T10:00:00Z"
}
```

#### DELETE /api/memory/forget/:customerId
Delete all customer data (GDPR compliance).

**Request:**
```json
{
  "reason": "User requested deletion"
}
```

**Response:**
```json
{
  "success": true,
  "customerId": "customer-123",
  "message": "Customer data has been deleted"
}
```

### Vector Search

#### POST /api/memory/vector/search
Semantic search for products or conversations.

**Request:**
```json
{
  "query": "something relaxing for anxiety",
  "searchType": "products",  // or "conversations"
  "options": {
    "limit": 10,
    "minScore": 0.7,
    "filters": {
      "category": "flower"
    }
  }
}
```

**Response:**
```json
{
  "query": "something relaxing for anxiety",
  "searchType": "products",
  "results": [
    {
      "productId": "prod-123",
      "name": "Granddaddy Purple",
      "strain": "Indica",
      "effects": ["relaxing", "sleep"],
      "score": 0.92
    }
  ],
  "count": 5
}
```

#### POST /api/memory/vector/product
Store product embedding for semantic search.

**Request:**
```json
{
  "product": {
    "productId": "prod-123",
    "name": "Blue Dream",
    "description": "A balanced hybrid strain...",
    "strain": "Hybrid",
    "effects": ["uplifting", "creative", "relaxing"],
    "category": "flower"
  }
}
```

### Analytics

#### GET /api/memory/analytics/insights
Aggregate customer insights over time period.

**Query Parameters:**
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date

**Response:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "insights": [
    {
      "date": "2025-01-15",
      "active_customers": 450,
      "total_interactions": 1250,
      "avg_engagement": 0.75,
      "avg_sentiment": 0.65
    }
  ]
}
```

#### GET /api/memory/analytics/churn-cohort
Identify customers at risk of churning.

**Query Parameters:**
- `riskThreshold`: 0-1 (default: 0.7)

**Response:**
```json
{
  "riskThreshold": 0.7,
  "cohort": [
    {
      "customer_id": "customer-123",
      "churn_risk": 0.85,
      "last_interaction_date": "2024-11-01T00:00:00Z",
      "last_purchase_date": "2024-10-15T00:00:00Z",
      "lifetime_value": 2500.00
    }
  ],
  "totalAtRisk": 23
}
```

#### GET /api/memory/analytics/ltv/:customerId
Calculate customer lifetime value.

**Response:**
```json
{
  "customerId": "customer-123",
  "total_spent": 2500.00,
  "order_count": 18,
  "avg_order_value": 138.89,
  "first_purchase": "2024-01-15T00:00:00Z",
  "last_purchase": "2025-01-10T00:00:00Z"
}
```

## Integration Guide

### 1. Reasoning Gateway Integration

The memory system is automatically integrated with the DeepSeek reasoning processor. When enabled, it:

1. **Enriches prompts** with customer context before sending to AI
2. **Learns from responses** automatically after completion
3. **Tracks conversation patterns** for better recommendations

**Enable in environment:**
```bash
ENABLE_MEMORY_LEARNING=true
```

**Usage in reasoning jobs:**
```javascript
// In job metadata, include customerId
await reasoningQueue.add('reasoning-task', {
  prompt: "What do you recommend for sleep?",
  sessionId: "session-456",
  metadata: {
    customerId: "customer-123"  // This triggers memory enrichment
  }
});
```

### 2. Voice Service Integration

To integrate with voice service:

```javascript
import { getMemoryLearningEngine } from '../common/memory/learning-engine.js';

async function handleVoiceInteraction(customerId, transcript, aiResponse) {
  const memoryEngine = await getMemoryLearningEngine({ logger });

  await memoryEngine.learnFromInteraction(customerId, {
    message: transcript,
    response: aiResponse,
    channel: 'voice',
    sessionId: req.sessionId,
    timestamp: new Date().toISOString()
  });
}
```

### 3. BigQuery Integration

**Enable in environment:**
```bash
ENABLE_BIGQUERY_MEMORY=true
GCP_PROJECT_ID=your-project-id
MEMORY_DATASET_ID=customer_memory
BIGQUERY_BATCH_SIZE=100
BIGQUERY_FLUSH_INTERVAL_MS=30000
```

The BigQuery adapter automatically:
- Batches writes for efficiency
- Creates partitioned tables
- Stores profiles, interactions, purchases, predictions, and audit logs
- Provides advanced analytics queries

### 4. Vector Embeddings Integration

**Enable in environment:**
```bash
ENABLE_VECTOR_EMBEDDINGS=true
OPENAI_API_KEY=your-openai-key
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
VECTOR_TTL_DAYS=365
CONVERSATION_VECTOR_TTL_DAYS=90
```

Features:
- Semantic product search
- Similar conversation retrieval
- Context-aware recommendations
- Automatic embedding storage

### 5. Product Catalog Integration

Index your product catalog for semantic search:

```javascript
import { VectorEmbeddingService } from './common/memory/vector-embeddings.js';

const vectorService = await VectorEmbeddingService.create({ logger });

// Index products
const products = await fetchProductCatalog();
await vectorService.batchStoreProductEmbeddings(products);

// Search products
const results = await vectorService.findSimilarProducts(
  "something relaxing for anxiety",
  { limit: 10, minScore: 0.7 }
);
```

## Environment Variables

### Core Settings
```bash
# Redis connection
MEMORY_REDIS_URL=redis://localhost:6379

# Encryption (32-byte hex key)
MEMORY_ENCRYPTION_KEY=your-64-character-hex-key

# TTL settings
MEMORY_PROFILE_TTL_DAYS=2555  # 7 years (cannabis regulation)
SESSION_TTL_SECONDS=3600
AUDIT_LOG_TTL_DAYS=2555

# Feature flags
ENABLE_MEMORY_LEARNING=true
ENABLE_BIGQUERY_MEMORY=true
ENABLE_VECTOR_EMBEDDINGS=true
```

### BigQuery Settings
```bash
GCP_PROJECT_ID=livhana-prod
MEMORY_DATASET_ID=customer_memory
BIGQUERY_BATCH_SIZE=100
BIGQUERY_FLUSH_INTERVAL_MS=30000
```

### Vector Settings
```bash
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
VECTOR_TTL_DAYS=365
CONVERSATION_VECTOR_TTL_DAYS=90
```

## Performance Optimization

### 1. Profile Caching
- Profiles are cached in-memory for 10 seconds
- Sub-10ms retrieval for hot profiles
- Automatic cache invalidation on updates

### 2. Async Learning
- Learning happens asynchronously
- Does not block AI responses
- Background processing with BullMQ

### 3. Batch Processing
- BigQuery writes are batched (100 rows or 30s interval)
- Reduces API calls and costs
- Configurable batch size and interval

### 4. Redis Vector Indexes
- FLAT algorithm for fast similarity search
- COSINE distance metric
- Automatic index creation on startup

## Privacy & Compliance

### 1. Data Encryption
- AES-256-GCM encryption for sensitive data
- Environment-based encryption keys
- Encrypted at rest in Redis

### 2. Right to be Forgotten
- Complete data deletion via `/api/memory/forget/:customerId`
- Removes from Redis and BigQuery
- Audit log entry for compliance

### 3. Data Retention
- Cannabis regulations: 7 years (2555 days)
- Configurable retention periods
- Automatic TTL enforcement

### 4. Audit Logging
- All operations logged
- Customer-specific audit trails
- Immutable audit records in BigQuery

## Testing

Run comprehensive test suite:

```bash
cd backend/common
npm test memory/learning-engine.test.js
```

Tests cover:
- Profile management
- Learning from interactions
- Purchase history tracking
- Prediction algorithms
- Context management
- Privacy features
- Weighted list operations

## Monitoring & Observability

### Health Check
```bash
GET /api/memory/health
```

Returns status of:
- Memory Engine
- BigQuery Adapter
- Vector Service
- Redis Connection

### Logging

All operations are logged with structured logging:
- Customer ID
- Operation type
- Timestamps
- Error details
- Performance metrics

Example:
```json
{
  "level": "info",
  "customerId": "customer-123",
  "interactionId": "uuid",
  "msg": "Learned from interaction"
}
```

## Performance Benchmarks

- **Profile Retrieval**: < 10ms (cached), < 50ms (Redis)
- **Learning Operation**: < 100ms (async)
- **Context Enrichment**: < 200ms (with vectors)
- **Vector Search**: < 100ms (top 10 results)
- **BigQuery Batch Write**: < 1s (100 rows)

## Roadmap

### Phase 1 (Current)
- ✅ Core memory engine
- ✅ Profile management
- ✅ Learning algorithms
- ✅ Prediction models
- ✅ BigQuery integration
- ✅ Vector embeddings
- ✅ API endpoints

### Phase 2 (Next)
- 🔄 Advanced ML models (TensorFlow.js)
- 🔄 Real-time recommendation engine
- 🔄 A/B testing framework
- 🔄 Admin dashboard integration
- 🔄 Customer 360 view
- 🔄 Lifetime value optimization

### Phase 3 (Future)
- 📋 Fine-tuned Liv Hana personality model
- 📋 Multi-modal learning (voice, text, images)
- 📋 Predictive inventory management
- 📋 Dynamic pricing based on customer value
- 📋 Automated retention campaigns

## Support

For questions or issues:
- Technical Lead: Jesse Niesen
- Documentation: `/docs/MEMORY_LEARNING_SYSTEM.md`
- Tests: `/backend/common/memory/*.test.js`

## License

Proprietary - Liv Hana, Inc. 2025

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->
