## 6. DATA CONSISTENCY RISK SUMMARY

| Risk | Likelihood | Impact | Mitigation | Priority |
|------|-----------|--------|------------|----------|
| BigQuery sync lag (15min) | High | Low | Add real-time checkout validation | MEDIUM |
| Price drift during checkout | Medium | Medium | Lock price at cart add | MEDIUM |
| Age verification expiry edge case | Low | High | Add 30-day renewal grace period | MEDIUM |
| Duplicate payment on retry | Low | High | Implement idempotency keys | HIGH |
| Membership billing failure | Medium | High | Add 7-day grace period + retry | HIGH |
| Raffle draw audit trail | Low | Critical | Store draw_seed in BigQuery | HIGH |
| Square API rate limit | Low | Medium | Respect Retry-After header (already implemented) | LOW |
| Redis cache eviction | Low | Low | Fallback to BigQuery (already implemented) | LOW |
| BigQuery quota exceeded | Very Low | High | Enable billing alerts, increase quota | MEDIUM |

---
