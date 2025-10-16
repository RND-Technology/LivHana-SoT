## 🚀 DEPLOYMENT

**Domain**: highfromhemp.com
**Service**: herb-landing (new Cloud Run service)
**Port**: 8080
**Health Check**: /health

**Deploy Command**:
```bash
cd empire/content-engine/herb-landing
docker build -t gcr.io/reggieanddrodispensary/herb-landing:latest .
docker push gcr.io/reggieanddrodispensary/herb-landing:latest
gcloud run deploy herb-landing \
  --image gcr.io/reggieanddrodispensary/herb-landing:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --project reggieanddrodispensary
```

---

**Status**: SPEC COMPLETE ✅
**Assigned**: Replit
**Priority**: URGENT (LFG!!)
**Timeline**: 10 hours to deployment

**LET'S F***ING GO!** 🚀🌿

---

**Last Updated**: 2025-10-08T05:43Z
**Created By**: Claude Code (Sonnet 4.5)
**For**: Replit (HERB Landing Page)
