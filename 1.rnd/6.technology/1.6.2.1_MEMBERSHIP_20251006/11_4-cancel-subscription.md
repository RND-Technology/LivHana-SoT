### 4. Cancel Subscription

Cancel a customer's membership. Subscription remains active until end of current billing period.

**Endpoint:** `PUT /api/memberships/:customerId/cancel`

**Request Body:**

```json
{
  "reason": "Customer requested cancellation"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Membership cancelled successfully",
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "customer@example.com",
    "tier": "SILVER",
    "status": "cancelled",
    "price": 97.00,
    "discount_percent": 20,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "payment_method_id": "PM_xyz789",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z",
    "cancel_date": "2025-10-15T10:00:00.000Z",
    "created_at": "2025-10-01T12:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z",
    "cancel_reason": "Customer requested cancellation"
  }
}
```

**Error Responses:**

- `404 Not Found`: No active membership found
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Payment gateway error

---
