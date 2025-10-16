### Key Metrics to Watch (First 24 Hours)

1. **Success Rate**

   ```sql
   SELECT
     COUNT(*) as total_attempts,
     SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) as successful,
     ROUND(SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as success_rate
   FROM `your-project.commerce.age_verification_attempts`
   WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR);
   ```

   **Target:** > 95% for valid customers

2. **Processing Time**
   - Check logs for `processingTime` field
   - **Target:** < 100ms average

3. **Cache Hit Rate**

   ```sql
   SELECT
     method,
     COUNT(*) as count
   FROM `your-project.commerce.age_verification_attempts`
   WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
   GROUP BY method;
   ```

   **Target:** > 80% cache hits after initial verifications

4. **Rate Limit Hits**

   ```sql
   SELECT COUNT(*) as rate_limit_hits
   FROM `your-project.commerce.age_verification_attempts`
   WHERE method = 'rate_limit'
     AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR);
   ```

   **Alert if:** > 10 hits per hour (possible abuse)

---
