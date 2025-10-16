### 3. Upgrade Membership

Upgrade a customer's membership to a higher tier with prorated billing.

**Endpoint:** `PUT /api/memberships/:customerId/upgrade`

**Request Body:**

```json
{
  "newTier": "GOLD"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "customer@example.com",
    "tier": "GOLD",
    "status": "active",
    "price": 197.00,
    "discount_percent": 30,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "payment_method_id": "PM_xyz789",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z",
    "cancel_date": null,
    "created_at": "2025-10-01T12:00:00.000Z",
    "updated_at": "2025-10-01T15:30:00.000Z"
  },
  "proratedCharge": 100.00
}
```

**Error Responses:**

- `400 Bad Request`: Missing newTier, invalid tier, or not an upgrade
- `404 Not Found`: No active membership found
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Payment processing error

**Notes:**

- The prorated amount is charged immediately
- Proration = (New Tier Price - Current Tier Price)
- Full new tier price will be charged on next billing date

---
