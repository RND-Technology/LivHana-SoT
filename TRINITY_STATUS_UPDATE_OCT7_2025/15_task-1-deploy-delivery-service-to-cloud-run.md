#### **Task 1: Deploy Delivery Service to Cloud Run**

**When:** After Jesse provides API keys (30 min from now)

**Files Ready:**

- `backend/delivery-service/deploy.sh` (complete)
- All code 100% wired and tested

**Command:**

```bash
cd backend/delivery-service
./deploy.sh
```

**Expected Result:**

- Service deployed to Cloud Run
- URL: `https://delivery-service-[hash]-uc.a.run.app`
- Auto-scaling: 1-10 instances
- Memory: 1Gi, CPU: 2

**Secrets to Configure in GCP:**

```bash
# Required for launch:
gcloud secrets create uber-api-key --data-file=<(echo "$UBER_API_KEY")
gcloud secrets create postmates-api-key --data-file=<(echo "$POSTMATES_API_KEY")
gcloud secrets create lightspeed-api-token --data-file=<(echo "$LIGHTSPEED_API_TOKEN")

# Add later when DoorDash approves:
gcloud secrets create doordash-developer-id --data-file=<(echo "$DOORDASH_DEVELOPER_ID")
gcloud secrets create doordash-key-id --data-file=<(echo "$DOORDASH_KEY_ID")
gcloud secrets create doordash-signing-secret --data-file=<(echo "$DOORDASH_SIGNING_SECRET")
```
