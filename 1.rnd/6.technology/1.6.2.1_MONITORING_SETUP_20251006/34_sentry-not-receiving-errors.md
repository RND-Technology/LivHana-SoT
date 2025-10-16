### Sentry Not Receiving Errors

1. Check DSN is correct
2. Verify Sentry middleware is registered
3. Check `beforeSend` filter not blocking events
4. Verify network connectivity to Sentry
5. Check if quota exceeded
