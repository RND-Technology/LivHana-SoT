### Service Resources (Cloud Run)

| Service | CPU | Memory | Max Instances | Startup |
|---------|-----|--------|---------------|---------|
| vibe-cockpit | 2 | 2Gi | 10 | Cold |
| integration-service | 1 | 1Gi | 5 | Warm (min 1) |
| payment-service | 1 | 512Mi | 10 | Warm (min 1) |
| reasoning-gateway | 2 | 2Gi | 3 | Cold |
| cannabis-service | 1 | 512Mi | 5 | Cold |
| voice-service | 1 | 1Gi | 3 | Cold |
| content-engine | 2 | 4Gi | 2 | Cold |
