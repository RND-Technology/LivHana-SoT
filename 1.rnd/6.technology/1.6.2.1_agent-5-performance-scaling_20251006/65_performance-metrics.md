### Performance Metrics

**Backend:**

- API response time: p50 < 100ms, p95 < 500ms, p99 < 1s
- BigQuery query time: p50 < 200ms, p95 < 1s
- Worker job processing: p50 < 1s, p95 < 3s
- Redis cache hit rate: > 85%

**Frontend:**

- Initial bundle size: < 1MB gzipped
- Time to interactive: < 2s on 4G
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

**Infrastructure:**

- CPU utilization: < 70% average
- Memory utilization: < 80% average
- Redis memory: < 75% of allocated
- Disk I/O wait: < 5%

**Business Metrics:**

- API availability: > 99.9%
- Error rate: < 0.1%
- Support tickets (performance): < 5/week
- Page load time: < 3s (95th percentile)
