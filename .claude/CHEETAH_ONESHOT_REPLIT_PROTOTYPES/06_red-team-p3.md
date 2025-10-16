### Red Team (P3)
- **Test duplicate sales**: Same saleID inserted twice → should deduplicate
- **Test missing fields**: Sale with no customer → 'anonymous'
- **Test large batches**: 1000+ sales → memory limits
- **Test rate limits**: BigQuery quota exceeded → retry with backoff
