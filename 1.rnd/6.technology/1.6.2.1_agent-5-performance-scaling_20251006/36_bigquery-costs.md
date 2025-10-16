### BigQuery Costs

**Current Usage Estimate** (11K members):

- Dashboard queries: ~1MB per query × 1000 queries/day = 1GB/day
- Historical queries: ~5MB per query × 200 queries/day = 1GB/day
- Memory writes: ~10MB/day
- **Total**: ~2GB/day processed = ~$0.30/day = **$9/month**

**With Optimizations**:

- Partitioned queries: 60% reduction
- Streaming inserts: Free
- **Optimized**: ~$3.60/month (60% savings)

**Texas Scale (50K members, Year 1)**:

- Dashboard queries: ~5MB × 5000/day = 25GB/day
- Historical queries: ~25MB × 1000/day = 25GB/day
- Memory writes: ~50MB/day
- **Total**: ~50GB/day = $7.50/day = **$225/month**
- **With optimizations**: ~$90/month
