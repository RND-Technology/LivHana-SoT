### **P0: Infrastructure Deployment (TODAY, 4-6 hours)**

1. Deploy voice-service to Cloud Run

   ```bash
   cd backend/voice-service  # Or wherever voice code lives
   gcloud run deploy voice-service --source . --region us-central1
   ```

2. Deploy reasoning-gateway to Cloud Run

   ```bash
   cd backend/reasoning-gateway
   gcloud run deploy reasoning-gateway --source . --region us-central1
   ```

3. Update frontend env vars (VITE_VOICE_API_BASE, VITE_REASONING_API_BASE)
4. Run health checks:

   ```bash
   curl https://voice-service-XXXXX.run.app/health
   curl https://reasoning-gateway-XXXXX.run.app/health
   ```

5. Run Playwright tests:

   ```bash
   pnpm playwright test --project=voice
   ```

**Evidence:** Deployment logs + health check outputs + Playwright results in `.evidence/2025-10-03/infrastructure-deploy/`

---
