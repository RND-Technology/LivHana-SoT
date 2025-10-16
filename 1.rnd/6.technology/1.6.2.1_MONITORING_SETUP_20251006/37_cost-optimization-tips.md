## Cost Optimization Tips

1. **New Relic**:
   - Use log sampling for high-volume services
   - Disable AI content recording for privacy and cost
   - Set up data dropping rules
   - Monitor data ingest dashboard

2. **Sentry**:
   - Filter out expected errors (404s, etc.)
   - Sample performance transactions (10-20%)
   - Use issue grouping effectively
   - Set up rate limiting per issue

3. **General**:
   - Start with free tiers
   - Monitor actual usage before upgrading
   - Review retention policies
   - Use sampling for high-traffic endpoints
