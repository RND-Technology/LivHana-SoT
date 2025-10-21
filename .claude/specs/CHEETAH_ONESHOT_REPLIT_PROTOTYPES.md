---
trigger: CHEETAH AUTONOMOUS EXECUTION
mode: MAX AUTO PARALLEL 100%
target: REPLIT WEEK 1 PROTOTYPES (5 prototypes)
status: READY TO EXECUTE
priority: APEX
---

# 🐆 CHEETAH ONE-SHOT: REPLIT WEEK 1 PROTOTYPES

**Command Trigger**: "CHEETAH: CODE IT ALL FAST NOW MAX AUTO MAX PARALLEL 100%"

**Mission**: Execute ALL 5 Replit prototypes in MAXIMUM PARALLEL mode using Unfuckwithable Code Protocol.

**Timeline**: 6 hours max (all 5 prototypes complete)

**Success**: All prototypes working with test data, deployed to Cloud Run, documented.

---

## 🎯 EXECUTION STRATEGY

### Parallel Work Streams (5 simultaneous)

```
┌─────────────────────────────────────────────────────────────┐
│ STREAM 1: Lightspeed → BigQuery Pipeline (CRITICAL)        │
│ STREAM 2: Customer Profile API                              │
│ STREAM 3: SI Recommendation Engine                          │
│ STREAM 4: Content-Commerce Bridge UI                        │
│ STREAM 5: Voice-to-Purchase (Stretch Goal)                  │
└─────────────────────────────────────────────────────────────┘
```

**Each stream follows**:
1. Read `.claude/PROMPT_1_SPEC_LOCK.md` → Create OpenAPI spec
2. Read `.claude/PROMPT_2_CODEGEN.md` → Write minimal code + tests
3. Read `.claude/PROMPT_3_RED_TEAM.md` → Attack & fix vulnerabilities
4. Deploy to Cloud Run with mock mode enabled
5. Document + test results + screenshots

---

## 📋 STREAM 1: LIGHTSPEED → BIGQUERY PIPELINE ⭐

**Priority**: CRITICAL (Foundation for all SI)
**File**: `backend/integration-service/src/lightspeed-bigquery.ts`
**Depends On**: Lightspeed token (available in 1Password)

### Spec Lock (P1)
```yaml
# specs/lightspeed-bigquery.spec.yaml
openapi: 3.1.0
paths:
  /sync/sales:
    post:
      summary: Sync Lightspeed sales to BigQuery
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  inserted:
                    type: integer
                  lastSync:
                    type: string

# Invariants:
# - All sales must have timestamp
# - Customer ID can be null (anonymous)
# - Product ID must exist
# - Price must be positive
# - Insert must be idempotent (no duplicates)

# Threat Model:
# - Duplicate sales (retry logic)
# - Missing fields (null handling)
# - Large batches (memory limits)
# - BigQuery rate limits
```

### Codegen (P2)
```typescript
// backend/integration-service/src/lightspeed-bigquery.ts

import { BigQuery } from '@google-cloud/bigquery';
import axios from 'axios';

interface LightspeedSale {
  saleID: string;
  completed_at: string;
  customer?: { id: string };
  Sale_Lines: Array<{
    Item?: { itemID: string; description: string };
    unitQuantity: number;
    calcTotal: string;
  }>;
  SalePayments: Array<{
    PaymentType?: { name: string };
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

export class LightspeedBigQueryPipeline {
  private lightspeed: axios.AxiosInstance;
  private bigquery: BigQuery;
  private dataset: string;
  private table: string;

  constructor() {
    const token = process.env.LIGHTSPEED_TOKEN;
    if (!token) {
      throw new Error('LIGHTSPEED_TOKEN required');
    }

    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 10000,
    });

    this.bigquery = new BigQuery({
      projectId: 'reggieanddrodispensary',
    });

    this.dataset = 'livhana_prod';
    this.table = 'sales';
  }

  async streamSalesData(since?: string): Promise<{ success: boolean; inserted: number }> {
    // 1. Fetch recent sales from Lightspeed
    const response = await this.lightspeed.get<{ Sale: LightspeedSale[] }>('/Account/1/Sale.json', {
      params: {
        completed_at: `>,${since ?? new Date(Date.now() - 86400000).toISOString()}`,
        load_relations: 'all',
      },
    });

    const sales = response.data.Sale ?? [];

    // 2. Transform to BigQuery schema
    const rows: BigQueryRow[] = sales.flatMap(sale =>
      sale.Sale_Lines.map(line => ({
        sale_id: sale.saleID,
        timestamp: sale.completed_at,
        customer_id: sale.customer?.id ?? 'anonymous',
        product_id: line.Item?.itemID ?? 'unknown',
        product_name: line.Item?.description ?? 'Unknown Product',
        quantity: line.unitQuantity,
        price: parseFloat(line.calcTotal),
        payment_method: sale.SalePayments[0]?.PaymentType?.name ?? 'unknown',
      }))
    );

    // 3. Insert into BigQuery (idempotent with sale_id deduplication)
    if (rows.length > 0) {
      await this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .insert(rows, { skipInvalidRows: true, ignoreUnknownValues: true });
    }

    return { success: true, inserted: rows.length };
  }
}
```

### Red Team (P3)
- **Test duplicate sales**: Same saleID inserted twice → should deduplicate
- **Test missing fields**: Sale with no customer → 'anonymous'
- **Test large batches**: 1000+ sales → memory limits
- **Test rate limits**: BigQuery quota exceeded → retry with backoff

### Deploy
```bash
cd backend/integration-service
gcloud run deploy lightspeed-bigquery \
  --source . \
  --region us-central1 \
  --set-env-vars="LIGHTSPEED_TOKEN=op://LivHana-Ops-Keys/LIGHTSPEED_PERSONAL_TOKEN/credential"
```

---

## 📋 STREAM 2: CUSTOMER PROFILE API

**File**: `backend/common/src/customer-profile-service.ts`
**Depends On**: BigQuery + Lightspeed

### Spec Lock (P1)
```yaml
# specs/customer-profile.spec.yaml
paths:
  /api/customers/{id}/profile:
    get:
      summary: Get enriched customer profile
      parameters:
        - name: id
          in: path
          required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerProfile'

components:
  schemas:
    CustomerProfile:
      type: object
      properties:
        id:
          type: string
        basic:
          type: object
        purchase_history:
          type: array
        preferences:
          type: object
        content_engagement:
          type: array
        predictions:
          type: object
```

### Codegen (P2)
```typescript
// backend/common/src/customer-profile-service.ts

import { BigQuery } from '@google-cloud/bigquery';
import axios from 'axios';

export class CustomerProfileService {
  private bigquery: BigQuery;
  private lightspeed: axios.AxiosInstance;

  constructor() {
    this.bigquery = new BigQuery({ projectId: 'reggieanddrodispensary' });
    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: { 'Authorization': `Bearer ${process.env.LIGHTSPEED_TOKEN}` },
    });
  }

  async getEnrichedProfile(customerId: string) {
    // Fetch data from all sources in parallel
    const [purchases, inventory, analytics] = await Promise.all([
      this.bigquery.query({
        query: `
          SELECT product_id, COUNT(*) as purchase_count, MAX(timestamp) as last_purchase
          FROM livhana_prod.sales
          WHERE customer_id = @customerId
          GROUP BY product_id
        `,
        params: { customerId },
      }),

      this.lightspeed.get(`/Account/1/Customer/${customerId}.json`).catch(() => null),

      this.bigquery.query({
        query: `
          SELECT content_type, COUNT(*) as views, AVG(engagement_time) as avg_time
          FROM livhana_prod.content_analytics
          WHERE customer_id = @customerId
          GROUP BY content_type
        `,
        params: { customerId },
      }).catch(() => []),
    ]);

    // Synthesize into unified profile
    return {
      id: customerId,
      basic: inventory?.data?.Customer ?? {},
      purchase_history: purchases[0] ?? [],
      preferences: this.extractPreferences(purchases[0] ?? []),
      content_engagement: analytics[0] ?? [],
      predictions: {
        next_purchase_date: this.predictNextPurchase(purchases[0] ?? []),
        likely_products: this.predictProducts(purchases[0] ?? []),
      },
    };
  }

  private extractPreferences(purchases: any[]) {
    const categories: Record<string, number> = {};
    purchases.forEach(p => {
      const cat = p.product_id?.split('-')[0] ?? 'other';
      categories[cat] = (categories[cat] ?? 0) + p.purchase_count;
    });
    return categories;
  }

  private predictNextPurchase(purchases: any[]) {
    if (purchases.length < 2) return null;
    const avgDays = 30;
    const lastPurchase = new Date(purchases[0]?.last_purchase);
    return new Date(lastPurchase.getTime() + avgDays * 24 * 60 * 60 * 1000).toISOString();
  }

  private predictProducts(purchases: any[]) {
    return purchases.slice(0, 5).map(p => ({
      product_id: p.product_id,
      confidence: p.purchase_count / purchases.length,
    }));
  }
}
```

---

## 📋 STREAM 3: SI RECOMMENDATION ENGINE

**File**: `backend/reasoning-gateway/src/si-recommendations.ts`
**Depends On**: BigQuery + Customer Profile

### Codegen (P2)
```typescript
// backend/reasoning-gateway/src/si-recommendations.ts

import { BigQuery } from '@google-cloud/bigquery';

export class SIRecommendationEngine {
  private bigquery: BigQuery;

  constructor() {
    this.bigquery = new BigQuery({ projectId: 'reggieanddrodispensary' });
  }

  async getRecommendations(customerId: string) {
    const query = `
      WITH customer_products AS (
        SELECT product_id
        FROM livhana_prod.sales
        WHERE customer_id = @customerId
      ),
      similar_customers AS (
        SELECT s.customer_id, COUNT(*) as overlap
        FROM livhana_prod.sales s
        WHERE s.product_id IN (SELECT product_id FROM customer_products)
        AND s.customer_id != @customerId
        GROUP BY s.customer_id
        ORDER BY overlap DESC
        LIMIT 50
      )
      SELECT s.product_id, COUNT(*) as purchase_count
      FROM livhana_prod.sales s
      JOIN similar_customers sc ON s.customer_id = sc.customer_id
      WHERE s.product_id NOT IN (SELECT product_id FROM customer_products)
      GROUP BY s.product_id
      ORDER BY purchase_count DESC
      LIMIT 10
    `;

    const [recommendations] = await this.bigquery.query({ query, params: { customerId } });

    return (recommendations ?? []).map((r: any) => ({
      product_id: r.product_id,
      reason: `${r.purchase_count} similar customers purchased this`,
      confidence: Math.min(r.purchase_count / 50, 1.0),
    }));
  }
}
```

---

## 📋 STREAM 4: CONTENT-COMMERCE BRIDGE UI

**File**: `frontend/herbitrage-voice/src/components/VideoPlayer.tsx`
**Depends On**: Recommendation engine

### Codegen (P2)
```tsx
// frontend/herbitrage-voice/src/components/VideoPlayer.tsx

import React, { useState, useEffect } from 'react';

interface Recommendation {
  product_id: string;
  reason: string;
  confidence: number;
}

interface VideoPlayerProps {
  episodeId: string;
  customerId: string;
}

export function VideoPlayerWithCommerce({ episodeId, customerId }: VideoPlayerProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showProduct, setShowProduct] = useState<Recommendation | null>(null);

  useEffect(() => {
    fetch(`/api/recommendations/${customerId}`)
      .then(r => r.json())
      .then(setRecommendations);
  }, [customerId]);

  const handleTimeUpdate = (currentTime: number) => {
    const placements: Record<number, Recommendation> = {
      30: recommendations[0]!,
      90: recommendations[1]!,
      150: recommendations[2]!,
    };

    if (placements[Math.floor(currentTime)]) {
      setShowProduct(placements[Math.floor(currentTime)]!);
    }
  };

  const handlePurchase = async (product: Recommendation) => {
    const response = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, productId: product.product_id }),
    });

    if (response.ok) {
      alert(`Purchased ${product.product_id}!`);
      setShowProduct(null);
    }
  };

  return (
    <div className="video-container">
      <video
        src={`/episodes/${episodeId}.mp4`}
        controls
        onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
      />

      {showProduct && (
        <div className="product-overlay">
          <h3>{showProduct.product_id}</h3>
          <p>{showProduct.reason}</p>
          <button onClick={() => handlePurchase(showProduct)}>Buy Now</button>
          <button onClick={() => setShowProduct(null)}>Later</button>
        </div>
      )}

      <div className="recommendations-sidebar">
        <h4>Featured Products</h4>
        {recommendations.map(r => (
          <div key={r.product_id} onClick={() => setShowProduct(r)}>
            {r.product_id}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📋 STREAM 5: VOICE-TO-PURCHASE (STRETCH)

**File**: `backend/reasoning-gateway/src/voice-commerce.ts`
**Depends On**: Claude API + Lightspeed

### Codegen (P2)
```typescript
// backend/reasoning-gateway/src/voice-commerce.ts

import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

export class VoiceCommerceEngine {
  private claude: Anthropic;
  private lightspeed: axios.AxiosInstance;

  constructor() {
    this.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: { 'Authorization': `Bearer ${process.env.LIGHTSPEED_TOKEN}` },
    });
  }

  async processVoiceCommand(transcript: string, customerId: string) {
    const history = await this.getCustomerHistory(customerId);

    const intentPrompt = `
User said: "${transcript}"
Customer purchases: ${JSON.stringify(history)}

Extract:
1. Intent (reorder | new_purchase | question | feedback)
2. Product (if mentioned)
3. Quantity (if mentioned)

Response format: { intent, product, quantity }
`;

    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: intentPrompt }],
    });

    const intent = JSON.parse(message.content[0]?.text ?? '{}');

    if (intent.intent === 'reorder') {
      const product = await this.findProduct(intent.product, customerId);

      const order = await this.lightspeed.post('/Account/1/Sale.json', {
        customerID: customerId,
        SaleLines: [{
          itemID: product.id,
          unitQuantity: intent.quantity ?? 1,
        }],
      });

      return {
        success: true,
        message: `Ordered ${product.name}. Total: $${order.data.total}`,
        order_id: order.data.saleID,
      };
    }

    return { success: false, message: 'Could not process command' };
  }

  private async getCustomerHistory(customerId: string) {
    const [rows] = await this.bigquery.query({
      query: `SELECT product_name, COUNT(*) as count FROM livhana_prod.sales WHERE customer_id = @customerId GROUP BY product_name ORDER BY count DESC LIMIT 10`,
      params: { customerId },
    });
    return rows;
  }

  private async findProduct(productName: string, customerId: string) {
    const [rows] = await this.bigquery.query({
      query: `SELECT product_id, product_name FROM livhana_prod.sales WHERE customer_id = @customerId AND product_name LIKE @productName LIMIT 1`,
      params: { customerId, productName: `%${productName}%` },
    });
    return rows[0];
  }
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

For each prototype:
- [ ] Spec created (P1: Spec Lock)
- [ ] Code written (P2: Codegen)
- [ ] Tests passing (unit + property)
- [ ] Red team passed (P3: exploit tests)
- [ ] Deployed to Cloud Run
- [ ] Test results documented
- [ ] Screenshots captured
- [ ] Branch pushed: `replit-prototypes-week1`

---

## ✅ SUCCESS CRITERIA

### Functional
- [ ] Prototype 1: Sales sync to BigQuery (<60s latency)
- [ ] Prototype 2: Customer profile API (sub-second response)
- [ ] Prototype 3: SI recommendations (10 personalized items)
- [ ] Prototype 4: Video player with purchase overlay
- [ ] Prototype 5: Voice command creates Lightspeed order

### Technical
- [ ] All services TypeScript strict mode
- [ ] All services have OpenAPI specs
- [ ] All services have property tests
- [ ] All services deployed to Cloud Run
- [ ] All services documented with examples

### Handoff
- [ ] Git branch: `replit-prototypes-week1` pushed
- [ ] Demo video for each prototype
- [ ] README with setup instructions
- [ ] Known limitations documented
- [ ] Next steps identified for Claude Code hardening

---

## 🐆 CHEETAH EXECUTION PROTOCOL

1. **Read dependencies**:
   - `.claude/UNFUCKWITHABLE_CODE_PROTOCOL.md`
   - `.claude/PROMPT_1_SPEC_LOCK.md`
   - `.claude/PROMPT_2_CODEGEN.md`
   - `.claude/PROMPT_3_RED_TEAM.md`

2. **For each prototype (in parallel)**:
   - Create spec (P1)
   - Write code + tests (P2)
   - Attack & fix (P3)
   - Deploy to Cloud Run
   - Document results

3. **Aggregate results**:
   - Create branch: `replit-prototypes-week1`
   - Commit all prototypes
   - Push to GitHub
   - Create `REPLIT_WEEK1_RESULTS.md`

4. **Report completion**:
   - Total time elapsed
   - Prototypes complete: X/5
   - Deployment URLs
   - Test results
   - Next steps for Claude Code

---

**Trigger**: "CHEETAH: CODE IT ALL FAST NOW MAX AUTO MAX PARALLEL 100%"

**Status**: READY TO EXECUTE ⚡

**Expected completion**: 6 hours

**Owner**: Cheetah (Autonomous)

**Assigned by**: Claude Code (Sonnet 4.5)

**Date**: 2025-10-08

---

*LFG CHEETAH! 🐆⚡ MAX VELOCITY MODE ACTIVATED!*
