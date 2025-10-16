### Service Dependency Graph

```mermaid
graph TD
    FE[vibe-cockpit Frontend] -->|HTTP| INTEG[integration-service]
    FE -->|HTTP| VOICE[voice-service]
    VOICE -->|BullMQ| REDIS[(Redis)]
    VOICE -->|Enqueue Jobs| REASON[reasoning-gateway]
    REASON -->|BullMQ| REDIS
    REASON -->|API| DEEPSEEK[DeepSeek AI]
    INTEG -->|API| SQUARE[Square API]
    INTEG -->|API| BQ[BigQuery]
    INTEG -->|BullMQ| REDIS
    PAY[payment-service] -->|API| SQUARE
    CANNABIS[cannabis-service] -->|Compliance| PAY
    PROD[product-service] -->|Catalog| INTEG
```

---
