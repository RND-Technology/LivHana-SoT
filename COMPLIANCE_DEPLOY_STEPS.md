# Compliance Service Deployment Steps

**Generated:** 2025-10-21
**Status:** Ready for deployment
**Compliance:** AGE21 + NIST + Medical Claims + LifeWard

---

## Pre-Deployment Checklist

- [x] Secrets verified (DEEPSEEK_API_KEY, JWT_SECRET1)
- [x] TRUTH pipeline validated
- [x] Config files present (config/compliance_guardrails.json)
- [ ] Docker installed (for containerized deployment)
- [ ] GCP authenticated (for Cloud Run deployment)

---

## Deployment Options

### Option 1: Local Development (Fastest)

```bash
cd backend/compliance-service
pip install -r requirements.txt
python api.py
# Service runs on http://localhost:8000
```

**Verify:**

```bash
curl http://localhost:8000/health
```

### Option 2: Docker (Recommended for staging)

```bash
cd backend/compliance-service
docker-compose up -d
# Service runs on http://localhost:8000
```

**Verify:**

```bash
docker ps | grep compliance
curl http://localhost:8000/health
```

### Option 3: Google Cloud Run (Production)

```bash
cd backend/compliance-service
gcloud run deploy compliance-service \
  --source . \
  --region us-central1 \
  --project reggieanddrodispensary \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10
```

**Note:** Requires `secretmanager.secrets.list` permission (currently blocked for <jesseniesen@gmail.com>)

---

## Post-Deployment Verification

1. **Health Check**

   ```bash
   curl http://localhost:8000/health
   ```

2. **Age Verification Test**

   ```bash
   curl -X POST http://localhost:8000/api/v1/verify-age \
     -H "Content-Type: application/json" \
     -d '{"birthdate": "2000-01-01"}'
   ```

3. **Medical Claims Test**

   ```bash
   curl -X POST http://localhost:8000/api/v1/check-medical-claims \
     -H "Content-Type: application/json" \
     -d '{"content": "This cannabis product cures cancer"}'
   # Should return: blocked=true
   ```

---

## Next Steps

1. Choose deployment option (Local recommended for immediate testing)
2. Run deployment commands
3. Execute post-deployment verification
4. Update .claude/SESSION_PROGRESS.md with deployment status
5. Commit changes to git

---

## Troubleshooting

**Port 8000 already in use:**

```bash
lsof -i :8000
kill -9 <PID>
```

**Docker build fails:**

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**GCP permission denied:**

- Contact project admin to grant secretmanager.secrets.list permission
- Or use local/Docker deployment instead

---

## API Endpoints

- `GET /health` - Health check
- `POST /api/v1/verify-age` - Age verification
- `POST /api/v1/validate-cannabinoid` - NIST validation
- `POST /api/v1/check-medical-claims` - Medical claims blocking
- `POST /api/v1/comprehensive-check` - Combined validation

---

**Document:** COMPLIANCE_DEPLOY_STEPS.md
**Service:** backend/compliance-service
**Config:** config/compliance_guardrails.json
**Log:** logs/verify_pipeline.log
