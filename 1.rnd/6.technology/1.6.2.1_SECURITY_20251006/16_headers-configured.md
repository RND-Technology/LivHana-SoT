#### Headers Configured

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Strict CSP | Prevent XSS attacks |
| `Strict-Transport-Security` | max-age=31536000 | Force HTTPS |
| `X-Frame-Options` | DENY | Prevent clickjacking |
| `X-Content-Type-Options` | nosniff | Prevent MIME sniffing |
| `X-XSS-Protection` | 1; mode=block | Legacy XSS protection |
| `Referrer-Policy` | strict-origin-when-cross-origin | Control referrer info |
| `X-DNS-Prefetch-Control` | off | Disable DNS prefetching |
| `Permissions-Policy` | Restrictive | Control browser features |
