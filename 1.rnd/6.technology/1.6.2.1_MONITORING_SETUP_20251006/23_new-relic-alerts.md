### New Relic Alerts

1. Go to Alerts & AI → Alert Conditions
2. Create alert policies:

**Critical Alerts** (Immediate notification):

- Service is down (Health check fails)
- Error rate > 5%
- Response time P95 > 2s

**Warning Alerts** (Notification within 15 minutes):

- Error rate > 1%
- Response time P95 > 1s
- Memory usage > 80%
- Queue depth > 500

3. Configure notification channels:
   - Email
   - Slack (#alerts channel)
   - PagerDuty (for P0 alerts)
