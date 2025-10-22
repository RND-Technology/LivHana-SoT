# Deployment Debugger Skill

## Description

Systematically debug deployment issues using four-phase framework: root cause investigation, pattern analysis, hypothesis testing, implementation.

## When to Invoke

- Deployment fails
- Service returns errors
- GCP permission issues
- API integration problems
- User mentions "broken", "error", "failed", "blocked"

## Process

### Phase 1: Root Cause Investigation

1. **Gather Error Context**
   - Read error logs
   - Check service status
   - Review recent changes
   - Identify failure point

2. **Collect Evidence**

   ```bash
   # Cloud Run logs
   gcloud run logs read SERVICE_NAME --limit=50

   # Service health
   curl SERVICE_URL/health

   # GCP permissions
   gcloud projects get-iam-policy PROJECT_ID
   ```

### Phase 2: Pattern Analysis

1. **Check Similar Issues**
   - Search deployment logs
   - Review previous fixes
   - Identify patterns

2. **Classify Error Type**
   - Permissions (GCP IAM)
   - Configuration (env vars, secrets)
   - Dependencies (missing packages)
   - Network (connectivity, timeouts)
   - Code (bugs, syntax errors)

### Phase 3: Hypothesis Testing

1. **Form Hypothesis**
   - Based on evidence
   - Prioritized by likelihood

2. **Test Solutions**
   - Start with lowest-risk
   - Validate each step
   - Document results

### Phase 4: Implementation

1. **Apply Fix**
   - Make minimal changes
   - Test thoroughly
   - Verify in production

2. **Prevent Recurrence**
   - Update documentation
   - Add error handling
   - Create runbook entry

## Common Issues & Solutions

### GCP Storage Permission Error

**Symptom**: `storage.buckets.create permission denied`
**Root Cause**: Insufficient IAM roles
**Fix**: Grant `roles/storage.admin` or use existing bucket
**Prevention**: Pre-deploy permission checklist

### Missing API Keys

**Symptom**: Service starts but returns 500 errors
**Root Cause**: ENV vars not set
**Fix**: `gcloud run services update --set-env-vars`
**Prevention**: Validate keys in deploy script

### Slack Bot Event URL 404

**Symptom**: Slack says "URL verification failed"
**Root Cause**: Wrong URL or service not deployed
**Fix**: Update Slack app with correct Cloud Run URL
**Prevention**: Auto-generate URL after deploy

## Output Format

```
🔍 Root Cause: [Identified issue]
📊 Evidence: [Logs, errors, status]
💡 Hypothesis: [Proposed solution]
✅ Fix Applied: [What was done]
🎯 Prevention: [How to avoid in future]
```

## Integration

- Deployment scripts: Auto-invoke on failure
- Error logs: Parse and analyze
- Runbooks: Update with fixes
