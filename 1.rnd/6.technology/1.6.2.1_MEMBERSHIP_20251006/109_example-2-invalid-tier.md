### Example 2: Invalid Tier

```javascript
const response = await fetch('/api/memberships/subscribe', {
  method: 'POST',
  // ...
  body: JSON.stringify({
    tier: 'PLATINUM' // Invalid
  })
});

// Response: 400 Bad Request
{
  "success": false,
  "error": "Invalid membership tier. Must be one of: BRONZE, SILVER, GOLD"
}
```
