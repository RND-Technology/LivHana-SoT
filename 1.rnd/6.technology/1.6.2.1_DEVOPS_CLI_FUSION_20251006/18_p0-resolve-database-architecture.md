### **P0: Resolve Database Architecture**

1. Read existing backend code to confirm database strategy

   ```bash
   grep -r "database\|client\|prisma\|sequelize" backend/ empire/ | head -30
   ```

2. If no transactional DB exists → Provision Cloud SQL (PostgreSQL)

   ```bash
   gcloud sql instances create reggieanddro-db \
     --database-version=POSTGRES_14 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

3. Run migrations for verification tables (use Prisma or Alembic)
4. Update `.env` with `DATABASE_URL`

**Evidence:** Database connection test + schema dump in `.evidence/2025-10-03/database/`

---
