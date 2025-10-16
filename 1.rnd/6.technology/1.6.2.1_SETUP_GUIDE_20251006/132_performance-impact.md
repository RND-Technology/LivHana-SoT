## Performance Impact

- **Latency**: < 5ms per request (Redis lookup)
- **Memory**: ~1KB per unique IP/user in window
- **CPU**: Negligible overhead
- **Redis**: ~10 ops/sec per 100 req/sec
