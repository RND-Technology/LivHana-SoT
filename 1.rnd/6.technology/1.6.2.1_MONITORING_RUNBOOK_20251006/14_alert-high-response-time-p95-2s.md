#### Alert: High Response Time (P95 > 2s)

**Trigger**: 95th percentile response time exceeds 2 seconds

**Impact**: Degraded user experience

**Response**:

1. Check New Relic APM for slow transactions
2. Identify slow database queries or external API calls
3. Check if specific endpoint is causing slowdown
4. Review recent code changes
5. Check system resources (CPU, memory, disk I/O)
6. Consider scaling horizontally if traffic spike
7. Optimize slow queries or add caching

**Resolution**: Optimize performance or scale resources
