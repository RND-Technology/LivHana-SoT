### Key Metrics to Track

1. **Monthly Recurring Revenue (MRR)**
   - Query: `GET /api/memberships/stats`
   - Alert if drops >5% week-over-week

2. **Churn Rate**
   - Query: `GET /api/memberships/stats`
   - Alert if exceeds 10% monthly

3. **Payment Failures**
   - Check KAJA gateway logs
   - Alert on failure rate >5%

4. **API Response Times**
   - Monitor subscription creation latency
   - Alert if >2 seconds
