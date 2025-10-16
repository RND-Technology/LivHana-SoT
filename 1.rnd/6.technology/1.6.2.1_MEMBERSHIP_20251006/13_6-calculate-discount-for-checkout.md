### 6. Calculate Discount for Checkout

Calculate the membership discount for a given order subtotal.

**Endpoint:** `GET /api/memberships/discount/:customerId?subtotal=100.00`

**Query Parameters:**

- `subtotal` (required): Order subtotal before discount

**Example:** `GET /api/memberships/discount/CUST_12345?subtotal=150.00`

**Response (200 OK) - With Membership:**

```json
{
  "success": true,
  "hasDiscount": true,
  "discountAmount": 30.00,
  "discountPercent": 20,
  "finalTotal": 120.00,
  "tier": "SILVER"
}
```

**Response (200 OK) - No Membership:**

```json
{
  "success": true,
  "hasDiscount": false,
  "discountAmount": 0,
  "discountPercent": 0,
  "finalTotal": 150.00
}
```

**Error Responses:**

- `400 Bad Request`: Missing subtotal parameter
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

**Usage:**
This endpoint should be called during checkout to:

1. Check if customer has active membership
2. Calculate discount amount
3. Display savings to customer
4. Apply discount to final order total

---
