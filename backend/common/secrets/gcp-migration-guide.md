# GCP Secret Manager Migration Guide

## Overview
This guide provides step-by-step instructions for migrating secrets from `.env` files to GCP Secret Manager for production deployment.

## Why GCP Secret Manager?
- **Security**: Encrypted at rest and in transit
- **Audit Logging**: Track all secret access
- **Versioning**: Maintain secret history
- **Access Control**: Fine-grained IAM permissions
- **Rotation**: Easy secret rotation without redeployment

## Prerequisites

1. GCP Project with Secret Manager API enabled
2. Service account with Secret Manager permissions
3. `gcloud` CLI installed and authenticated

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create service account
gcloud iam service-accounts create livhana-secrets-manager \
  --display-name="LivHana Secrets Manager"

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:livhana-secrets-manager@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Secrets Inventory

### Critical Secrets (Migrate First - P0)
- `JWT_SECRET` - JSON Web Token signing key
- `JWT_AUDIENCE` - JWT audience claim
- `JWT_ISSUER` - JWT issuer claim
- `REDIS_PASSWORD` - Redis authentication
- `DATABASE_PASSWORD` - Database credentials

### API Keys (P1)
- `SQUARE_ACCESS_TOKEN` - Square API access
- `SQUARE_APPLICATION_ID` - Square application ID
- `LIGHTSPEED_API_KEY` - Lightspeed integration
- `ANTHROPIC_API_KEY` - Claude API key
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `OPENAI_API_KEY` - OpenAI API key

### Integration Secrets (P2)
- `NOTION_API_KEY` - Notion integration
- `TWILIO_AUTH_TOKEN` - Twilio SMS/voice
- `SMTP_PASSWORD` - Email service
- `STRIPE_SECRET_KEY` - Payment processing

### Monitoring & Observability (P3)
- `SENTRY_DSN` - Error tracking
- `NEWRELIC_LICENSE_KEY` - APM monitoring
- `DATADOG_API_KEY` - Metrics/logs

## Migration Steps

### Step 1: Create Secrets in GCP

```bash
# Create secret from .env file
cat backend/integration-service/.env | grep JWT_SECRET | cut -d '=' -f2 | \
  gcloud secrets create JWT_SECRET --data-file=-

# Or create from stdin
echo "your-secret-value" | \
  gcloud secrets create SECRET_NAME --data-file=-

# Set labels for organization
gcloud secrets update JWT_SECRET \
  --update-labels=environment=production,service=integration-service,tier=p0
```

### Step 2: Grant Access to Services

```bash
# Grant secret access to specific service account
gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:integration-service@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant to multiple services
for service in integration-service voice-service reasoning-gateway; do
  gcloud secrets add-iam-policy-binding JWT_SECRET \
    --member="serviceAccount:${service}@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 3: Update Application Code

The `secret-manager.js` module is already implemented and ready to use:

```javascript
const { getSecret } = require('../../common/secrets/secret-manager.js');

// Load secret at startup
const jwtSecret = await getSecret('JWT_SECRET');

// Use in configuration
const config = {
  secret: jwtSecret,
  // ... other config
};
```

### Step 4: Update Deployment Configuration

**Cloud Run**:
```yaml
# cloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: integration-service
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
    spec:
      serviceAccountName: integration-service@PROJECT_ID.iam.gserviceaccount.com
      containers:
      - image: gcr.io/PROJECT_ID/integration-service
        env:
        - name: GCP_PROJECT
          value: "PROJECT_ID"
        - name: ENABLE_SECRET_MANAGER
          value: "true"
```

**Kubernetes**:
```yaml
# k8s-deployment.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: integration-service
  annotations:
    iam.gke.io/gcp-service-account: integration-service@PROJECT_ID.iam.gserviceaccount.com
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: integration-service
spec:
  template:
    spec:
      serviceAccountName: integration-service
      containers:
      - name: integration-service
        env:
        - name: GCP_PROJECT
          value: "PROJECT_ID"
        - name: ENABLE_SECRET_MANAGER
          value: "true"
```

### Step 5: Verify Access

```bash
# Test secret access
gcloud secrets versions access latest --secret=JWT_SECRET

# Test from service account
gcloud secrets versions access latest --secret=JWT_SECRET \
  --impersonate-service-account=integration-service@PROJECT_ID.iam.gserviceaccount.com
```

## Migration Script

Use the provided migration script to automate the process:

```bash
# Run migration script
node backend/common/secrets/migrate-to-gcp.js \
  --env-file=backend/integration-service/.env \
  --project-id=PROJECT_ID \
  --service=integration-service

# Dry run (preview changes)
node backend/common/secrets/migrate-to-gcp.js \
  --env-file=backend/integration-service/.env \
  --project-id=PROJECT_ID \
  --dry-run
```

## Rollback Plan

If issues occur during migration:

1. **Immediate Rollback**: Re-enable `.env` files
```bash
# Set environment variable to disable Secret Manager
export ENABLE_SECRET_MANAGER=false

# Restart services
kubectl rollout restart deployment/integration-service
```

2. **Restore Previous Version**:
```bash
# Rollback to previous secret version
gcloud secrets versions disable latest --secret=JWT_SECRET
gcloud secrets versions enable VERSION_NUMBER --secret=JWT_SECRET
```

## Secret Rotation

### Rotating Secrets

```bash
# Add new version
echo "new-secret-value" | \
  gcloud secrets versions add JWT_SECRET --data-file=-

# Disable old version (after verifying new version works)
gcloud secrets versions disable VERSION_NUMBER --secret=JWT_SECRET
```

### Automated Rotation

```javascript
// Implement rotation in application
const { refreshJWTConfig } = require('../../common/auth/config-secure.js');

// Rotate every 30 days
setInterval(async () => {
  await refreshJWTConfig();
  logger.info('JWT config refreshed from Secret Manager');
}, 30 * 24 * 60 * 60 * 1000);
```

## Best Practices

### 1. Secret Naming Convention
- Use UPPER_SNAKE_CASE
- Prefix with service name if service-specific: `INTEGRATION_SERVICE_API_KEY`
- Suffix with environment if needed: `JWT_SECRET_PROD`

### 2. Labels
Always add labels to secrets:
```bash
gcloud secrets update SECRET_NAME \
  --update-labels=environment=production,service=integration-service,tier=p0,owner=platform-team
```

### 3. Access Control
- Use least-privilege principle
- Create service-specific service accounts
- Never use personal accounts for production secrets

### 4. Audit Logging
Enable audit logs for Secret Manager:
```bash
# View audit logs
gcloud logging read "resource.type=secretmanager.googleapis.com/Secret" \
  --limit=50 \
  --format=json
```

### 5. Monitoring
Set up alerts for:
- Failed secret access attempts
- Unusual access patterns
- Secret version changes

## Validation Checklist

Before going live:

- [ ] All critical secrets migrated to GCP Secret Manager
- [ ] Service accounts created with proper permissions
- [ ] IAM policies configured (least privilege)
- [ ] Audit logging enabled
- [ ] Application tested with Secret Manager
- [ ] Rollback plan tested
- [ ] Monitoring/alerting configured
- [ ] Documentation updated
- [ ] Team trained on secret rotation process
- [ ] `.env` files removed from production deployments
- [ ] `.env` added to `.gitignore` (verified)

## Cost Considerations

GCP Secret Manager pricing:
- **Secret versions**: $0.06 per active secret version per month
- **Access operations**: $0.03 per 10,000 operations

Example monthly cost for 50 secrets:
- 50 secrets × $0.06 = $3.00/month
- 1M access operations × $0.03 = $3.00/month
- **Total: ~$6/month**

## Support & Troubleshooting

### Common Issues

**Issue**: "Permission denied" when accessing secret
```bash
# Solution: Check IAM permissions
gcloud secrets get-iam-policy SECRET_NAME
```

**Issue**: Secret not found
```bash
# Solution: Verify secret exists and service account has access
gcloud secrets list --filter="name:SECRET_NAME"
```

**Issue**: Application not loading secrets
```bash
# Solution: Check service account configuration
gcloud iam service-accounts get-iam-policy SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com
```

## References

- [GCP Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Best Practices for Secret Management](https://cloud.google.com/secret-manager/docs/best-practices)
- [Secret Manager IAM Roles](https://cloud.google.com/secret-manager/docs/access-control)

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
