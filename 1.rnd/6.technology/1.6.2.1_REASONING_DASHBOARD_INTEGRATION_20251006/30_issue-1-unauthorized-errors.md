### Issue 1: "Unauthorized" Errors

**Symptom**: API returns 401 Unauthorized

**Causes**:

1. Token expired (current token valid for 7 days)
2. Token not properly signed with JWT_SECRET
3. Token missing from request headers

**Solutions**:

1. Regenerate token using `node scripts/generate-dev-token.js`
2. Clear localStorage and refresh browser
3. Check Authorization header format: `Bearer <token>`
4. Verify JWT_SECRET matches in backend .env file
