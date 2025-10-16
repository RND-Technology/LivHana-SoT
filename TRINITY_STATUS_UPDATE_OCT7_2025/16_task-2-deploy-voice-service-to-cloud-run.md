#### **Task 2: Deploy Voice Service to Cloud Run**
**When:** After Jesse provides ElevenLabs API key

**Files Ready:**
- `backend/voice-service/deploy.sh` (complete)
- All code 100% wired

**Command:**
```bash
cd backend/voice-service
./deploy.sh
```

**Secrets to Configure:**
```bash
gcloud secrets create elevenlabs-api-key --data-file=<(echo "$ELEVENLABS_API_KEY")
```
