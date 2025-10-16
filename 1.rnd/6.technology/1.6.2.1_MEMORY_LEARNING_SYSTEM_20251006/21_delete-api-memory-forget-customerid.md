#### DELETE /api/memory/forget/:customerId

Delete all customer data (GDPR compliance).

**Request:**

```json
{
  "reason": "User requested deletion"
}
```

**Response:**

```json
{
  "success": true,
  "customerId": "customer-123",
  "message": "Customer data has been deleted"
}
```
