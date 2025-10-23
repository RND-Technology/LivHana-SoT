# GCS Bucket Setup - Manual Steps Required

**Date**: 2025-10-23  
**Status**: ⚠️ BLOCKED - Permissions needed  
**Blocker**: `jesseniesen@gmail.com` lacks `storage.buckets.create` permission

---

## The Problem

```
ERROR: jesseniesen@gmail.com does not have storage.buckets.create access
Permission 'storage.buckets.create' denied on resource
```

**Root cause**: Your user account needs Storage Admin role on the GCP project.

---

## Fix Option 1: Grant Yourself Permission (Recommended)

**Run this command** (requires project owner/editor role):

```bash
gcloud projects add-iam-policy-binding reggieanddrodispensary \
  --member="user:jesseniesen@gmail.com" \
  --role="roles/storage.admin"
```

**Then retry bucket creation**:
```bash
BUCKET="livhana-rpm-exports"
gcloud storage buckets create "gs://$BUCKET" \
  --location=US \
  --uniform-bucket-level-access
```

---

## Fix Option 2: Use Existing Service Account

**If bucket already exists** (check with owner account):
```bash
gcloud storage buckets list | grep livhana-rpm
```

**If it exists, just add IAM binding**:
```bash
PN=$(gcloud projects describe reggieanddrodispensary --format='value(projectNumber)')
SA="${PN}-compute@developer.gserviceaccount.com"
BUCKET="livhana-rpm-exports"

gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member="serviceAccount:$SA" \
  --role=roles/storage.objectAdmin
```

---

## Fix Option 3: Use Console (Visual)

1. Go to: https://console.cloud.google.com/storage/browser?project=reggieanddrodispensary
2. Click "CREATE BUCKET"
3. Name: `livhana-rpm-exports`
4. Location: `us-central1` (or Multi-region `US`)
5. Storage class: Standard
6. Access control: Uniform
7. Click "CREATE"

Then grant service account access:
1. Click bucket → Permissions tab
2. Click "GRANT ACCESS"
3. Principal: `980910443251-compute@developer.gserviceaccount.com`
4. Role: `Storage Object Admin`
5. Save

---

## Verification

**After permissions granted**, test:
```bash
# List buckets (should show livhana-rpm-exports)
gcloud storage buckets list | grep livhana-rpm

# Test write access
echo "test" | gcloud storage cp - gs://livhana-rpm-exports/test.txt

# Test read
gcloud storage cat gs://livhana-rpm-exports/test.txt

# Cleanup test file
gcloud storage rm gs://livhana-rpm-exports/test.txt
```

---

## Status

**Current**: ❌ BLOCKED - awaiting permissions  
**Next**: Run Fix Option 1 or use Console (Option 3)  
**Impact**: RPM exports can't upload to GCS until resolved

---

**Once fixed, RPM system will be 100% operational.** ✅

