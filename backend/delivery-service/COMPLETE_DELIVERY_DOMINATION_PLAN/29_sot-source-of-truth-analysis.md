### SOT (Source of Truth) Analysis

**Single Source of Truth: Lightspeed**

```
Lightspeed (reggieanddro.com)
  ├─ Inventory (canonical)
  ├─ Orders (canonical)
  ├─ Customers (canonical)
  └─ Delivery Status (synced from providers)

Delivery Providers (external)
  ├─ Driver location (real-time)
  ├─ ETA (calculated)
  └─ Completion status (synced to Lightspeed)
```

**Data Flow:**
1. Customer places order → Lightspeed
2. Order triggers webhook → Our middleware
3. Middleware selects provider → Creates delivery
4. Provider updates → Synced to Lightspeed → Customer sees status

**No Data Duplication:** All order data lives in Lightspeed, delivery data synced real-time

---
