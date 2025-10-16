### 🔴 **Task 2A: Customer Verification API → Build on Trinity Backend**

**Translation:** Don't build standalone Flask microservice → Extend existing Trinity backend

**Step 1: Locate Existing Backend**

```bash
find backend/ empire/ -name "*verif*" -o -name "*customer*" -o -name "*auth*" | head -20
```

**Step 2: Read Backend Architecture**

```bash
cat backend/README.md  # If exists
cat backend/package.json  # Check if Node.js backend
cat backend/requirements.txt  # Check if Python backend
```

**Step 3: Build Verification Endpoint**

- If Node.js (Express/Fastify): Add route in `backend/src/routes/customer.ts`
- If Python (Flask/FastAPI): Add route in `backend/app/routes/customer.py`
- Database: Use Cloud SQL (PostgreSQL) for transactional verification flags
- Schema: Follow guide's `customer_verification` table (lines 210-212)

**Deployment:**

```bash
# Deploy to Cloud Run
gcloud run deploy backend-api \
  --source backend/ \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://...,SQUARE_API_KEY=..."
```

**Evidence:** `curl` test + logs in `.evidence/2025-10-03/api/verification-endpoint.txt`

---
