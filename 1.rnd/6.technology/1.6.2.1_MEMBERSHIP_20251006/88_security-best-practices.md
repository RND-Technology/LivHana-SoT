## Security Best Practices

1. **JWT Tokens:** Always verify signature, audience, and issuer
2. **Payment Data:** Never store raw payment card numbers
3. **Admin Access:** Restrict stats endpoint to admin role only
4. **HTTPS Only:** All production traffic must use HTTPS
5. **Audit Logging:** Log all membership changes with user context
6. **Rate Limiting:** Prevent brute force and abuse
7. **Input Validation:** Validate all user inputs server-side
