### **Phase 1: Fix Existing Profit Engine (24 hours)**

**Target**: Multiply reggieanddro.com revenue by removing blockers

1. **Fix Ecwid Category Box CSS Bug** (2 hours)
   - Method: Playwright automation or middleware proxy
   - Impact: Customers see categories → easier navigation → estimated 10% conversion improvement
   - Blocker: Ecwid API permissions (awaiting support ticket)
   - Workaround: Browser automation with admin credentials

2. **Connect Real Lightspeed API** (6 hours)
   - Current: Mock data only (lightspeed-client.js)
   - Target: Real inventory sync
   - Impact: Eliminate manual inventory updates → save Jesse's time
   - Technical: Replace mock getProducts() with real API calls

3. **Validate Full Checkout Flow** (2 hours)
   - Test: Product page → Cart → Checkout → Payment → Order capture
   - Fix: Any friction points in payment flow
   - Impact: 1% checkout improvement = thousands in recovered revenue

**Success Metric**: reggieanddro.com conversion rate measurably increases
