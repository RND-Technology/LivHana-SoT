### "Sentry not capturing errors"

1. Check SENTRY_DSN is correct
2. Verify middleware order (sentryErrorHandler must be AFTER routes)
3. Test with: `throw new Error('test')`
4. Check Sentry quota in dashboard
