#### Features

- **IP-based limiting** for unauthenticated requests
- **User-based limiting** for authenticated requests
- **Dynamic tier selection** based on authentication status
- **Rate limit headers** (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`)
- **Graceful degradation** when Redis unavailable
- **Real-time statistics** available at `/api/monitoring/rate-limit/stats`
