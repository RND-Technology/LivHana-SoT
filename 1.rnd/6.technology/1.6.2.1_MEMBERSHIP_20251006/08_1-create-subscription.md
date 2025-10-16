### 1. Create Subscription

Create a new membership subscription for a customer.

**Endpoint:** `POST /api/memberships/subscribe`

**Request Body:**

```json
{
  "customerId": "CUST_12345",
  "email": "customer@example.com",
  "tier": "SILVER",
  "paymentMethod": {
    "id": "pm_12345",
    "type": "card",
    "last4": "4242"
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "customer@example.com",
    "tier": "SILVER",
    "status": "active",
    "price": 97.00,
    "discount_percent": 20,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "payment_method_id": "PM_xyz789",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z",
    "cancel_date": null,
    "created_at": "2025-10-01T12:00:00.000Z",
    "updated_at": "2025-10-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields or customer already has active membership
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Payment processing or database error

---
