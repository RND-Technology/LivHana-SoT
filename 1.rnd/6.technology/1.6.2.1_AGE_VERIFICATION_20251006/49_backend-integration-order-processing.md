### Backend Integration (Order Processing)

```javascript
// In your order processing endpoint
app.post('/api/orders', authMiddleware, async (req, res) => {
  const { customerId, items } = req.body;

  // Check age verification
  const verifyResponse = await fetch(
    `http://localhost:3005/api/age-verification/status/${customerId}`,
    {
      headers: { 'Authorization': req.headers.authorization }
    }
  );

  const verification = await verifyResponse.json();

  if (!verification.verified || verification.expired) {
    return res.status(403).json({
      error: 'Age verification required',
      message: 'Please complete age verification before checkout'
    });
  }

  // Continue with order processing...
});
```

---
