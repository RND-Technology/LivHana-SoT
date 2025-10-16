### **P1: Deploy Backend API Extensions**

1. Create `/backend/src/routes/verification.ts` (Customer verification endpoints)
2. Create `/backend/src/routes/orders.ts` (Order flagging system)
3. Create `/backend/src/services/email.ts` (SendGrid integration)
4. Add tests: `/backend/src/routes/__tests__/verification.test.ts`
5. Deploy to Cloud Run:

   ```bash
   gcloud run deploy backend-api --source backend/ --region us-central1
   ```

6. Update frontend env: `VITE_BACKEND_API_URL=https://backend-api-XXXXX.run.app`

**Evidence:** Deployment logs + health check in `.evidence/2025-10-03/backend-deploy/`

---
