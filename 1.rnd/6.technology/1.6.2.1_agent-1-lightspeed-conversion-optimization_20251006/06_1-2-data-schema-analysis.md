### 1.2 Data Schema Analysis

**LightSpeed Transactions Table** (Lines 66-76 in LIGHTSPEED_SETUP.md):

```sql
analytics.lightspeed_transactions
├─ id: STRING (Transaction ID)
├─ amount: FLOAT (Subtotal)
├─ tax: FLOAT (Tax amount)
├─ total: FLOAT (Total amount)
├─ customer_id: STRING (Nullable)
├─ status: STRING (COMPLETED/PENDING)
├─ created_at: TIMESTAMP
└─ updated_at: TIMESTAMP (Nullable)
```

**LightSpeed Products Table** (Lines 78-88 in LIGHTSPEED_SETUP.md):

```sql
analytics.lightspeed_products
├─ id: STRING (Product ID)
├─ name: STRING (Product name)
├─ description: STRING (Nullable)
├─ category: STRING (Nullable)
├─ price: FLOAT (Selling price)
├─ cost: FLOAT (Cost price - Nullable)
├─ quantity: INTEGER (Stock quantity - Nullable)
├─ created_at: TIMESTAMP
└─ updated_at: TIMESTAMP (Nullable)
```
