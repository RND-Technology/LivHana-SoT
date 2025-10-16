### Layer 1: Frontend Layer (Cloud Run + Cloud Storage)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND LAYER - Next.js + Static Sites                    │
├─────────────────────────────────────────────────────────────┤
│ • Cloud Run: vibe-cockpit (Next.js SSR)                    │
│ • Cloud Storage: Static sites (69 domains)                 │
│ • Cloud CDN: Global content delivery                       │
│ • Cloud Load Balancer: SSL termination + routing          │
├─────────────────────────────────────────────────────────────┤
│ Domains:                                                    │
│ - reggieanddro.com (primary)                              │
│ - herbitrage.com                                           │
│ - oneplantsolution.com                                     │
│ - highnooncartoon.com                                      │
│ - + 65 more empire domains                                 │
└─────────────────────────────────────────────────────────────┘
```
