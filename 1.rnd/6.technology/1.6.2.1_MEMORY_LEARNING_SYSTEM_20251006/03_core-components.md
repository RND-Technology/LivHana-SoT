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
