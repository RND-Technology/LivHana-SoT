<!--
Optimized: 2025-10-03
RPM: 3.6.0.6.ops-technology-ship-status-documentation
Session: Dual-AI Collaboration - Sonnet Docs Sweep
-->
# Memory Learning System - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Install Dependencies

```bash
cd backend/common
npm install

cd ../reasoning-gateway
npm install
```

### 2. Configure Environment

Create or update `backend/reasoning-gateway/.env.runtime`:

```bash
# Minimum required for memory system
ENABLE_MEMORY_LEARNING=true
MEMORY_REDIS_URL=redis://localhost:6379
MEMORY_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Optional: BigQuery (for persistent storage)
ENABLE_BIGQUERY_MEMORY=false
GCP_PROJECT_ID=your-project-id

# Optional: Vector Embeddings (for semantic search)
ENABLE_VECTOR_EMBEDDINGS=false
OPENAI_API_KEY=your-openai-key
```

### 3. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or using local Redis
redis-server
```

### 4. Start Reasoning Gateway

```bash
cd backend/reasoning-gateway
npm run dev
```

## 🎯 Basic Usage

### Record a Customer Interaction

```bash
curl -X POST http://localhost:4002/api/memory/learn \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "interaction": {
      "message": "I need something for sleep and anxiety",
      "response": "I recommend Indica strains like Granddaddy Purple",
      "sentiment": 0.8,
      "sessionId": "session-456"
    }
  }'
```

### Get Customer Context

```bash
curl http://localhost:4002/api/memory/context/customer-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Predictions

```bash
curl -X POST http://localhost:4002/api/memory/predict/customer-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"predictionType": "all"}'
```

### Record a Purchase

```bash
curl -X POST http://localhost:4002/api/memory/purchase/customer-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase": {
      "orderId": "order-789",
      "amount": 150.00,
      "products": ["Blue Dream", "OG Kush"]
    }
  }'
```

## 🧪 Test the System

```bash
cd backend/common
npm test memory/learning-engine.test.js
```

## 📊 Monitor Health

```bash
curl http://localhost:4002/api/memory/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Integration Example

### With Reasoning Gateway

```javascript
// The memory system is automatically integrated!
// Just add customerId to job metadata:

await reasoningQueue.add('reasoning-task', {
  prompt: "What do you recommend?",
  sessionId: "session-123",
  metadata: {
    customerId: "customer-456"  // 👈 This enables memory learning
  }
});

// The system will:
// 1. Enrich the prompt with customer preferences
// 2. Send to DeepSeek AI
// 3. Learn from the response automatically
// 4. Update customer profile
```

### Manual Integration

```javascript
import { MemoryLearningEngine } from './common/memory/learning-engine.js';

const engine = await MemoryLearningEngine.create({ logger });

// Learn from interaction
await engine.learnFromInteraction('customer-123', {
  message: "Looking for pain relief",
  response: "Try CBD-rich strains",
  sessionId: "session-789"
});

// Get recommendations
const recs = await engine.getRecommendations('customer-123');
console.log(recs);

// Predict churn
const churn = await engine.calculateChurnRisk('customer-123');
if (churn.churnRisk > 0.7) {
  console.log('Customer at risk!');
}
```

## 🎨 Advanced Features

### Enable BigQuery (for analytics)

1. Set up GCP credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

2. Enable in .env:

```bash
ENABLE_BIGQUERY_MEMORY=true
GCP_PROJECT_ID=livhana-prod
```

3. Start service - tables are created automatically!

### Enable Vector Search (for semantic product matching)

1. Get OpenAI API key from <https://platform.openai.com>

2. Enable in .env:

```bash
ENABLE_VECTOR_EMBEDDINGS=true
OPENAI_API_KEY=sk-...
```

3. Index products:

```bash
curl -X POST http://localhost:4002/api/memory/vector/product \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "productId": "prod-123",
      "name": "Blue Dream",
      "description": "Uplifting hybrid strain",
      "strain": "Hybrid",
      "effects": ["uplifting", "creative", "relaxing"]
    }
  }'
```

4. Search semantically:

```bash
curl -X POST http://localhost:4002/api/memory/vector/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "something energizing for focus",
    "searchType": "products",
    "options": {"limit": 5}
  }'
```

## 🔐 Security

### Generate Encryption Key

```bash
# Generate a secure 256-bit key
openssl rand -hex 32
```

Add to `.env.runtime`:

```bash
MEMORY_ENCRYPTION_KEY=your-64-character-hex-key-here
```

All customer data in Redis is encrypted with AES-256-GCM.

### JWT Authentication

All memory endpoints require JWT authentication:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Configure JWT in `backend/common/auth/config.js`.

## 📈 Performance Tips

1. **Hot Profiles**: First retrieval < 50ms, cached < 10ms
2. **Batch Operations**: Use BigQuery for bulk analytics
3. **Redis Memory**: Monitor with `redis-cli info memory`
4. **Profile Cache**: 10-second in-memory cache
5. **Async Learning**: Learning doesn't block responses

## 🐛 Troubleshooting

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Check connection string
echo $MEMORY_REDIS_URL
```

### Memory Engine Not Learning

```bash
# Check feature flag
echo $ENABLE_MEMORY_LEARNING
# Should be: true

# Check logs
tail -f logs/reasoning-gateway.log | grep memory
```

### BigQuery Errors

```bash
# Verify credentials
gcloud auth application-default login

# Check project
gcloud config get-value project

# Test BigQuery access
bq ls
```

## 📚 Next Steps

1. Read full documentation: `/docs/MEMORY_LEARNING_SYSTEM.md`
2. Review API endpoints: Search for "API Endpoints" in docs
3. Run tests: `npm test memory/learning-engine.test.js`
4. Monitor health: `GET /api/memory/health`
5. Integrate with voice service
6. Set up admin dashboard

## 🆘 Support

- Documentation: `/docs/MEMORY_LEARNING_SYSTEM.md`
- Tests: `/backend/common/memory/*.test.js`
- Code: `/backend/common/memory/`
- API: `/backend/reasoning-gateway/src/routes/memory.js`

## 🚨 Important Notes

1. **Redis is required** - Memory system needs Redis to function
2. **BigQuery is optional** - For persistent analytics only
3. **Vector embeddings are optional** - For semantic search only
4. **Encryption is automatic** - When `MEMORY_ENCRYPTION_KEY` is set
5. **Data retention** - 7 years for cannabis compliance (configurable)

## 🎉 You're Ready

The memory system is now live and learning from every interaction. Watch your customers' profiles grow smarter over time!

**THIS IS WHAT MAKES US A UNICORN - NO COMPETITOR HAS THIS.**

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
