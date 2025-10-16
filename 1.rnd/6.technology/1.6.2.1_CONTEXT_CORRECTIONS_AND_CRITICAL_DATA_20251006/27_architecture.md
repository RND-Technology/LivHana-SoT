### Architecture

```
User Request
  ↓
Cloudflare Edge (DDoS protection, WAF, CDN)
  ↓
Google Cloud Load Balancer
  ↓
GCP Cloud Run (your services)
  ↓
BigQuery / Redis / etc
```
