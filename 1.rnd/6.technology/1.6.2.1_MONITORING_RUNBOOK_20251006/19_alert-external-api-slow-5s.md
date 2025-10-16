#### Alert: External API Slow (>5s)

**Trigger**: Square API or BigQuery calls taking longer than 5 seconds

**Impact**: Some requests experiencing delays

**Response**:

1. Check external service status pages
2. Verify API rate limits not exceeded
3. Consider implementing timeout and retry logic
4. Add circuit breaker if not present
5. Contact external service support if persistent

---
