### Issue: "Rate limit exceeded" for legitimate customers

**Solution:** Clear rate limit cache:

```javascript
// In age_verification_store.js, add admin endpoint:
router.post('/api/age-verification/admin/clear-rate-limit', async (req, res) => {
  const { customerId } = req.body;
  rateLimitCache.delete(customerId);
  res.json({ success: true });
});
```
