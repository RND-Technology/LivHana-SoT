# Reasoning Gateway

---
**Last Audited:** 2025-10-29
**Audited By:** Liv Hana (Tier-1)
**Marine Corps Standard:** Upheld ✅
**Next Audit:** 2025-11-28 (30 days)
---


SI Recommendation Engine + Voice Commerce Engine

## Services

### SI Recommendations (Port 8082)

Collaborative filtering recommendations

### Voice Commerce (Port 8083)

Voice command to purchase using Claude AI

## Deploy

```bash
# Deploy SI Recommendations
gcloud run deploy si-recommendations \
  --source . \
  --region us-central1 \
  --port 8082 \
  --set-env-vars="SERVICE=si-recommendations"

# Deploy Voice Commerce
gcloud run deploy voice-commerce \
  --source . \
  --region us-central1 \
  --port 8083 \
  --set-env-vars="SERVICE=voice-commerce,ANTHROPIC_API_KEY=xxx"
```
