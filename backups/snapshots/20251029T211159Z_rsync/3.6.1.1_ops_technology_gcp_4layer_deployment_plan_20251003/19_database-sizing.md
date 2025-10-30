### Database Sizing

**Cloud SQL (PostgreSQL)**

- Tier: db-f1-micro (1 vCPU, 0.6GB RAM) → Start small
- Storage: 10GB SSD (auto-expand enabled)
- Backups: Daily automated
- HA: Single-zone (upgrade to multi-zone in production)

**Memorystore (Redis)**

- Tier: Basic (1GB)
- Region: us-central1
- Replication: None initially

**BigQuery**

- On-demand pricing
- Datasets: cannabis_data, compliance_data
- Partitioned tables by date

---
