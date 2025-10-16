## Production Checklist

- [ ] GCP Secret Manager API enabled
- [ ] Service account created with secretAccessor role
- [ ] All secrets migrated to GCP
- [ ] Service account key securely stored
- [ ] `GCP_PROJECT_ID` set in production environment
- [ ] Auto-rotation enabled (`AUTO_ROTATE_SECRETS=true`)
- [ ] Health check endpoints added
- [ ] Monitoring alerts configured
- [ ] Rotation callback implemented
- [ ] Secrets removed from `.env` files
- [ ] `.gitignore` updated
- [ ] Team trained on new system
- [ ] Rollback plan documented
- [ ] Test rotation in staging

---
