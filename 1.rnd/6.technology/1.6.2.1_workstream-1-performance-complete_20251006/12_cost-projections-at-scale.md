### Cost Projections at Scale

**Current (11K members)**:

- BigQuery: $9/month → $3.60/month (60% savings)
- Infrastructure: $150-200/month (no change)
- Total: ~$160-210/month

**Texas Year 1 (50K members, $1.77M revenue)**:

- BigQuery: $225/month → $90/month (60% savings)
- Infrastructure: $600-800/month (scales with load)
- Redis: $120-180/month (shared cache)
- Total: ~$810-1,070/month (0.55% of revenue) ✅

**Texas Year 3 (200K members, $8.7M revenue)**:

- BigQuery: $500/month → $50/month (90% with partitioning)
- Infrastructure: $3,000-4,000/month (auto-scaling)
- Redis: $500-700/month (cluster mode)
- Total: ~$3,550-4,750/month (0.49% of revenue) ✅

**Savings with Partitioning** (when migration completes):

- Query cost: Additional 90% reduction
- Data scanned: 99% reduction (180 days → 1 day scans)
- At 200K scale: ~$450/month savings

---
