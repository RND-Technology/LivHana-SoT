### 2. Get Current Membership

Retrieve the current membership details for a customer.

**Endpoint:** `GET /api/memberships/:customerId`

**Example:** `GET /api/memberships/CUST_12345`

**Response (200 OK):**

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
    "updated_at": "2025-10-01T12:00:00.000Z",
    "benefits": [
      "20% discount on all products",
      "Access to exclusive strains",
      "Monthly gift with purchase",
      "Priority customer support",
      "Early access to new products"
    ]
  }
}
```

**Error Responses:**

- `404 Not Found`: No membership found for customer
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

---
