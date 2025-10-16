### Approval Not Working

1. Verify task status is `pending_approval`
2. Check JWT token has admin role
3. Verify request body format:

   ```json
   {"approved": true, "reason": "..."}
   ```
