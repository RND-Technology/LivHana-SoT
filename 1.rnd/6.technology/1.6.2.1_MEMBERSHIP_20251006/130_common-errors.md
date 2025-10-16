## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 400 - "Customer already has active membership" | Duplicate subscription | Check existing membership first |
| 400 - "Invalid membership tier" | Typo in tier name | Use: BRONZE, SILVER, or GOLD |
| 401 - "Unauthorized" | Missing/invalid JWT | Check Authorization header |
| 403 - "Insufficient permissions" | Not admin | Stats endpoint requires admin role |
| 404 - "No membership found" | Customer has no subscription | Customer not subscribed yet |
