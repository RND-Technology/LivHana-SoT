### Current Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Lightspeed auth expires | Medium | Medium | OAuth2 refresh token logic already implemented |
| BigQuery quota exceeded | Low | Low | Optimized queries use minimal data scan |
| Redis goes down | Medium | Low | Graceful fallback to in-memory cache |
| Square API rate limit | Low | Low | Batch operations with pagination |
| Cost spike | Low | Very Low | Caching + optimizations keep costs at $0.15/month |
