### **Week 2: Review API + BigQuery Schema**

**Goal:** Store internal LSTE reviews in database

**Tasks:**

1. [ ] Create BigQuery table: `product_reviews`

   ```sql
   CREATE TABLE knowledge.product_reviews (
     review_id STRING NOT NULL,
     product_sku STRING NOT NULL,
     batch_id STRING,
     customer_id STRING NOT NULL,
     headline STRING,
     body TEXT,
     look_score FLOAT64,
     smell_score FLOAT64,
     taste_score FLOAT64,
     effect_score FLOAT64,
     avg_lste_score FLOAT64,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     platform STRING DEFAULT 'livhana_internal'
   );
   ```

2. [ ] Create POST /api/product/:id/reviews endpoint
3. [ ] Connect ReviewModal.jsx to API
4. [ ] Test review submission flow
5. [ ] **Deliverable:** Internal reviews stored in BigQuery

---
