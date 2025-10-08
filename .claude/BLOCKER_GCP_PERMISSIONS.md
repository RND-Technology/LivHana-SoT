# BLOCKER: GCP Permissions Required

**Date**: 2025-10-08T00:32:00Z
**Reporter**: Claude Code (Sonnet 4.5)
**Priority**: CRITICAL - Blocks Voice Cockpit deployment (48h commitment)

---

## Issue

Voice Cockpit deployment to GCP Cloud Run **BLOCKED** by IAM permissions.

## Error Details

```
ERROR: (gcloud.builds.submit) The user is forbidden from accessing the bucket [reggieanddrodispensary_cloudbuild].
Please check your organization's policy or if the user has the "serviceusage.services.use" permission.
```

```
ERROR: (gcloud.run.services.list) [jesseniesen@gmail.com] does not have permission to access namespaces instance [reggieanddrodispensary] (or it may not exist): Permission 'run.services.list' denied on resource 'namespaces/reggieanddrodispensary/services'
```

## Required Permissions

Account: `jesseniesen@gmail.com`
Project: `reggieanddrodispensary`

**Missing IAM Roles**:
1. **Cloud Build Editor** (`roles/cloudbuild.builds.editor`) - For gcloud builds submit
2. **Cloud Run Admin** (`roles/run.admin`) - For Cloud Run deployments
3. **Service Usage Admin** (`roles/serviceusage.serviceUsageAdmin`) - For service access
4. **Storage Object Viewer** (`roles/storage.objectViewer`) - For Cloud Build bucket

## Impact

- ❌ Voice Cockpit CANNOT be deployed to GCP Cloud Run
- ❌ 48-hour commitment at risk
- ❌ Production deployment blocked
- ✅ Local testing possible (npm start on port 8080)

## Workaround (Temporary)

Voice Cockpit running locally for testing:
- URL: `http://localhost:8080`
- Status: RUNNING (background: df61fd)
- Functional: Yes (pending verification)

## Resolution Required

**Jesse**: Please grant IAM permissions via GCP Console:
1. Go to https://console.cloud.google.com/iam-admin/iam?project=reggieanddrodispensary
2. Find user: jesseniesen@gmail.com
3. Add roles:
   - Cloud Build Editor
   - Cloud Run Admin
   - Service Usage Admin

**Estimated Time**: 5 minutes
**Once resolved**: Deployment can complete in 10-15 minutes

## Alternative (If Replit has GCP access)

**Replit**: If your staging environment has GCP credentials, you could:
1. Pull latest code (`git pull origin main`)
2. Run `frontend/herbitrage-voice/deploy.sh`
3. Hand off deployed URL to Claude Code for verification

This would unblock the deployment while Jesse fixes permissions.

---

**Status**: ACTIVE BLOCKER
**Reported to**: Jesse (CEO), Codex (Commander), Replit (Staging)
**Next Action**: Awaiting IAM permission grant

---

**Last Updated**: 2025-10-08T00:32:00Z
