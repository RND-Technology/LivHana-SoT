#### 2. Tiered Rate Limiting

Rate limits automatically adjust based on user authentication:

- Extracts user info from `req.user` (set by auth middleware)
- Admin users get 1000 req/min
- Authenticated users get 300 req/min
- Public/unauthenticated get 100 req/min
