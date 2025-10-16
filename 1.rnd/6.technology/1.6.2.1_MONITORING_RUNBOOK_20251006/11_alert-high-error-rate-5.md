#### Alert: High Error Rate (>5%)

**Trigger**: Error rate exceeds 5% of total requests

**Impact**: Users experiencing errors

**Response**:

1. Check Sentry for error details and frequency
2. Identify common error patterns
3. Check if errors are from specific endpoint
4. Review recent code changes
5. Check external dependency status (Redis, BigQuery, Square API)
6. If widespread, consider rolling back recent deployment
7. Apply hotfix if quick resolution available

**Escalation**: If error rate continues to climb, escalate immediately
