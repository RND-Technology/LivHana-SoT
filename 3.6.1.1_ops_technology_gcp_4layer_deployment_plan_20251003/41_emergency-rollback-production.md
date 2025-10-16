### Emergency Rollback (Production)

```bash
# Revert to previous Cloud Run revision
gcloud run services update-traffic vibe-cockpit \
  --to-revisions=PREVIOUS_REVISION=100

# Scale down to zero
gcloud run services update vibe-cockpit --min-instances=0
```

---
