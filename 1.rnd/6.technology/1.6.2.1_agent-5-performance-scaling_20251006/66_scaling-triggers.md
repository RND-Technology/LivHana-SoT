### Scaling Triggers

**Horizontal Scaling (Add Instances):**

- CPU > 70% for 5 minutes
- Memory > 80% for 5 minutes
- API latency p95 > 1s
- Queue depth > 1000 jobs

**Vertical Scaling (Increase Resources):**

- Redis memory > 75%
- Persistent high CPU despite horizontal scaling
- Database connection pool exhaustion

**Alert Thresholds:**

- Critical: API availability < 99%
- Warning: Cache hit rate < 80%
- Info: Worker queue depth > 500

---
