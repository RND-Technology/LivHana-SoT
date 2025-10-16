### **How Context is Preserved Forever:**

1. **Notion Ingestion** (Real-Time)
   - Webhook triggers on every Notion update
   - Immediate sync to BigQuery
   - Full page history preserved

2. **Gmail Ingestion** (Daily Sync)
   - Cron job syncs all emails
   - Thread history maintained
   - Attachments preserved

3. **Memory Learning Engine**
   - Customer profiles (preferences, history)
   - Behavioral patterns tracked
   - ML predictions (churn, next purchase)
   - Redis cache for fast retrieval

4. **Vector Embeddings** (Semantic Search)
   - Every interaction embedded (OpenAI text-embedding-3-small)
   - Stored in Redis with COSINE distance
   - Semantic search finds relevant context
   - 150K token context window available

5. **Self-Improvement Tracking**
   - Learnings stored in BigQuery
   - Patterns extracted and reused
   - Success/failure history analyzed
