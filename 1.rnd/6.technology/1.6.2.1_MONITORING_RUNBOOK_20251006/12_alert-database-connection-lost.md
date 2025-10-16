#### Alert: Database Connection Lost

**Trigger**: Redis or BigQuery health check fails

**Impact**: Service cannot access data, requests failing

**Response**:

1. Check database connectivity: `redis-cli ping` or BigQuery console
2. Verify credentials and connection strings
3. Check firewall rules and network connectivity
4. Check database service status
5. Restart application to re-establish connections
6. If Redis is down, check if backup/replica is available

**Escalation**: Escalate to infrastructure team if database issue

---
