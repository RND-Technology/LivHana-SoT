### 5. Get Membership Statistics (Admin Only)

Retrieve comprehensive membership statistics and analytics.

**Endpoint:** `GET /api/memberships/stats`

**Authorization:** Requires admin role in JWT token

**Response (200 OK):**

```json
{
  "success": true,
  "stats": {
    "monthlyRecurringRevenue": 1349.00,
    "activeMembers": 17,
    "churnRate": "5.26%",
    "tierDistribution": {
      "BRONZE": 10,
      "SILVER": 5,
      "GOLD": 2
    },
    "lifetimeValueByTier": {
      "BRONZE": 564.00,
      "SILVER": 1164.00,
      "GOLD": 2364.00
    },
    "generatedAt": "2025-10-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `403 Forbidden`: User does not have admin role
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

**Metrics Explained:**

- **MRR (Monthly Recurring Revenue):** Total monthly revenue from all active subscriptions
- **Active Members:** Count of customers with active subscriptions
- **Churn Rate:** Percentage of members who cancelled in last 30 days
- **Tier Distribution:** Number of active members in each tier
- **Lifetime Value (LTV):** Estimated lifetime value per tier (monthly price × 12 months)

---
