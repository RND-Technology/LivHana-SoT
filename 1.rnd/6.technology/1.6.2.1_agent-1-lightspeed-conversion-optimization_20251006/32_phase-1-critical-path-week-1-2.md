### Phase 1: Critical Path (Week 1-2)

**Focus:** Maximum ROI with minimal dev time

**Day 1-3: Customer Enrichment**

```bash
# File: sync-lightspeed-to-bigquery.js
# Changes: Lines 194-205 (add customer fields)
# Testing: Verify customer_email, customer_phone in BigQuery
# Deploy: Run manual sync, verify data quality
```

**Day 4-5: Texas Tier Positioning**

```bash
# File: NEW - texas-market-optimizer.js
# Integration: Product sync pipeline
# Testing: Verify texas_tier field in products table
# Deploy: Update product display to show tier messaging
```

**Day 6-8: Real-Time Inventory**

```bash
# File: NEW - lightspeed-realtime-inventory.js
# Integration: WebSocket server for frontend
# Testing: Simulate low-stock scenarios
# Deploy: Add "Only X left!" messaging to product pages
```

**Day 9-10: Veteran Discount**

```bash
# File: NEW - veteran-discount.js
# Integration: Transaction sync pipeline
# Testing: Test with veteran test account
# Deploy: Announce veteran discount on social media
```
