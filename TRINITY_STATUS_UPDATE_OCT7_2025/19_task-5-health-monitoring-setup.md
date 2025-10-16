#### **Task 5: Health Monitoring Setup**
**When:** After deployment

**Endpoints to Monitor:**
```bash
# Delivery Service
curl https://delivery.reggieanddro.com/health

# Voice Service
curl https://voice.reggieanddro.com/health

# Expected: {"status":"healthy","features":{...}}
```

**Set up Cloud Monitoring:**
- Uptime checks every 5 minutes
- Alert if health check fails 3 times
- Alert if response time > 5 seconds

---
