### Test 3: Test Rate Limiting

Run the verify endpoint 4 times with the same customerId.

Expected 4th response (429):

```json
{
  "success": false,
  "error": "Too many verification attempts",
  "attempts": 3,
  "maxAttempts": 3
}
```

---
