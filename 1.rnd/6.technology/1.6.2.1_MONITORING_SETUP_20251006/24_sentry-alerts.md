### Sentry Alerts

1. Go to Alerts → Create Alert
2. Create alert rules:

**Critical Errors**:

- New error types appear
- Error frequency > 100/hour
- Error affects > 10 users

**Performance Issues**:

- Transaction duration P95 > 2s
- N+1 query detected

3. Configure notification channels:
   - Email
   - Slack (#alerts channel)
