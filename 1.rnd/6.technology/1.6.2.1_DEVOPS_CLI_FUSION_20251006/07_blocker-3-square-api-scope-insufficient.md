### 🔴 **BLOCKER #3: Square API Scope Insufficient**

**Claim:** "Square Refunds API + Catalog API + Customer API"
**Reality:** Square API token in 1Password may not have all required scopes

**Required Scopes for This Guide:**

- `ORDERS_READ`, `ORDERS_WRITE` (order flagging, refunds)
- `CUSTOMERS_READ`, `CUSTOMERS_WRITE` (verification status sync)
- `ITEMS_READ` (product catalog for emails)
- `PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS` (if using Square for refunds)
- `MERCHANT_PROFILE_READ` (for business details in emails)

**Validation Check:**

```bash
# Test Square API access
curl https://connect.squareup.com/v2/customers \
  -H "Authorization: Bearer YOUR_SQUARE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

If scope error → Re-authorize Square app with additional permissions via Square Developer Console

---
