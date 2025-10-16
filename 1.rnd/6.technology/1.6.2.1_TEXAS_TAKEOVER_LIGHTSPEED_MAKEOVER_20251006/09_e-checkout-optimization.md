#### E. Checkout Optimization

**2-Phase Age Verification Strategy:**

**Phase 1: Order Placement (No Verification Required)**

- Allow guest checkout OR quick account creation
- Collect: Name, Email, Phone, Shipping Address
- Payment via KAJA + Authorize.net
- Check database for existing Veriff approval

**Phase 2: Post-Order Verification (If Needed)**

- **IF Veriff approved:** Ship immediately
- **IF NOT verified:**
  - Email: "Complete age verification to ship your order"
  - Link to Veriff age verification
  - 72-hour countdown to auto-refund
  - Reminder emails at 48h, 24h, 12h, 1h
  - Auto-refund after 72 hours if not verified

**Membership Agreement:**

- **IF signed:** Ship order
- **IF NOT signed:**
  - Email: "Review and sign membership agreement"
  - Link to agreement (CANSPAM compliant opt-in)
  - 72-hour countdown
  - Auto-refund if not signed

**Checkout Flow:**

```
1. Cart → Review Order
2. Enter Email (check for existing account)
3. Shipping Address
4. Payment (KAJA + Authorize.net)
5. Order Confirmation
   ↓
6a. IF verified + member → Ship immediately
6b. IF NOT verified → Email verification link (72h countdown)
6c. IF NOT member → Email agreement link (72h countdown)
```

---
