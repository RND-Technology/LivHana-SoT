## Security Considerations

1. **IP Spoofing Prevention**
   - Use `trust proxy` in Express for accurate IP detection
   - Validate X-Forwarded-For headers

2. **Distributed Rate Limiting**
   - Redis ensures limits work across multiple instances
   - Use Redis Cluster for high availability

3. **Rate Limit Bypass**
   - Monitor admin accounts carefully
   - Log all rate limit resets
   - Alert on suspicious patterns

4. **DDoS Mitigation**
   - Rate limiting is first line of defense
   - Use WAF (Cloudflare, AWS WAF) for L7 attacks
   - Implement connection limits at load balancer
