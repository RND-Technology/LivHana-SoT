#!/bin/bash

# PRODUCTION SECRETS SETUP
# Moves all credentials to GCP Secret Manager for production deployment
# Ensures no plaintext secrets in logs or environment files

set -euo pipefail

PROJECT_ID="livhana-empire"
REGION="us-central1"
SERVICE_NAME="integration-service"

echo "🔐 Setting up production secrets for Liv Hana Integration Service"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Function to create secret if it doesn't exist
create_secret_if_not_exists() {
    local secret_name="$1"
    local description="$2"
    
    echo "Creating secret: $secret_name"
    
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
        echo "✅ Secret $secret_name already exists"
    else
        echo "Creating new secret: $secret_name"
        echo "placeholder-value" | gcloud secrets create "$secret_name" \
            --project="$PROJECT_ID" \
            --data-file=- \
            --replication-policy="automatic" \
            --labels="service=integration-service,environment=production"
        
        echo "Secret $secret_name created with placeholder value"
        echo "⚠️  IMPORTANT: Update the secret value with real credentials"
    fi
    echo ""
}

# Function to add secret version
add_secret_version() {
    local secret_name="$1"
    local secret_value="$2"
    
    echo "Updating secret: $secret_name"
    echo "$secret_value" | gcloud secrets versions add "$secret_name" \
        --project="$PROJECT_ID" \
        --data-file=-
    echo "✅ Secret $secret_name updated"
    echo ""
}

# 1. Integration Service Secrets
echo "📋 Setting up Integration Service secrets..."

# Veriff API credentials
create_secret_if_not_exists "veriff-api-key" "Veriff API key for age verification"
create_secret_if_not_exists "veriff-api-secret" "Veriff API secret for webhook verification"

# SendGrid email service
create_secret_if_not_exists "sendgrid-api-key" "SendGrid API key for email delivery"

# KAJA refund service
create_secret_if_not_exists "kaja-api-key" "KAJA API key for refund processing"
create_secret_if_not_exists "kaja-api-secret" "KAJA API secret for refund authentication"

# LightSpeed POS integration
create_secret_if_not_exists "lightspeed-api-key" "LightSpeed API key for POS integration"
create_secret_if_not_exists "lightspeed-api-secret" "LightSpeed API secret for webhook auth"

# Database credentials
create_secret_if_not_exists "db-password" "PostgreSQL database password"
create_secret_if_not_exists "db-user" "PostgreSQL database username"

# JWT secrets
create_secret_if_not_exists "jwt-secret" "JWT signing secret for webhook authentication"

# 2. Delivery Service Secrets
echo "📋 Setting up Delivery Service secrets..."

# DoorDash Drive API
create_secret_if_not_exists "doordash-api-key" "DoorDash Drive API key"
create_secret_if_not_exists "doordash-api-secret" "DoorDash Drive API secret"

# Uber Direct API
create_secret_if_not_exists "uber-api-key" "Uber Direct API key"
create_secret_if_not_exists "uber-api-secret" "Uber Direct API secret"

# Google Maps API
create_secret_if_not_exists "google-maps-api-key" "Google Maps API key for geocoding"

# Twilio SMS service
create_secret_if_not_exists "twilio-account-sid" "Twilio Account SID for SMS"
create_secret_if_not_exists "twilio-auth-token" "Twilio Auth Token for SMS"

# 3. Create Cloud Run service account
echo "📋 Setting up Cloud Run service account..."

SERVICE_ACCOUNT_NAME="integration-service-sa"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "✅ Service account $SERVICE_ACCOUNT_EMAIL already exists"
else
    echo "Creating service account: $SERVICE_ACCOUNT_EMAIL"
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
        --project="$PROJECT_ID" \
        --display-name="Integration Service Service Account" \
        --description="Service account for Liv Hana Integration Service"
    echo "✅ Service account created"
fi

# 4. Grant secret access
echo "📋 Granting secret access permissions..."

SECRETS=(
    "veriff-api-key"
    "veriff-api-secret"
    "sendgrid-api-key"
    "kaja-api-key"
    "kaja-api-secret"
    "lightspeed-api-key"
    "lightspeed-api-secret"
    "db-password"
    "db-user"
    "jwt-secret"
    "doordash-api-key"
    "doordash-api-secret"
    "uber-api-key"
    "uber-api-secret"
    "google-maps-api-key"
    "twilio-account-sid"
    "twilio-auth-token"
)

for secret in "${SECRETS[@]}"; do
    echo "Granting access to secret: $secret"
    gcloud secrets add-iam-policy-binding "$secret" \
        --project="$PROJECT_ID" \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet
done

# 5. Grant Cloud Tasks access
echo "📋 Granting Cloud Tasks permissions..."

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/cloudtasks.enqueuer" \
    --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/cloudtasks.queueAdmin" \
    --quiet

# 6. Grant Cloud SQL access
echo "📋 Granting Cloud SQL permissions..."

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/cloudsql.client" \
    --quiet

# 7. Grant BigQuery access
echo "📋 Granting BigQuery permissions..."

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/bigquery.dataEditor" \
    --quiet

# 8. Create Cloud Run deployment configuration
echo "📋 Creating Cloud Run deployment configuration..."

cat > "cloud-run-production.yaml" << EOF
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: $SERVICE_NAME
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/memory: "2Gi"
        run.googleapis.com/cpu: "2"
    spec:
      serviceAccountName: $SERVICE_ACCOUNT_EMAIL
      containerConcurrency: 1000
      timeoutSeconds: 300
      containers:
      - image: gcr.io/$PROJECT_ID/$SERVICE_NAME:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: GOOGLE_CLOUD_PROJECT
          value: "$PROJECT_ID"
        - name: GOOGLE_CLOUD_LOCATION
          value: "$REGION"
        - name: SERVICE_URL
          value: "https://$SERVICE_NAME-980910443251.$REGION.run.app"
        - name: DB_HOST
          value: "/cloudsql/$PROJECT_ID:$REGION:livhana-integration-db"
        - name: DB_NAME
          value: "livhana_integration"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-user
              key: latest
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-password
              key: latest
[REDACTED - SECURITY BREACH]
          valueFrom:
            secretKeyRef:
              name: veriff-api-key
              key: latest
        - name: VERIFF_API_SECRET
          valueFrom:
            secretKeyRef:
              name: veriff-api-secret
              key: latest
        - name: SENDGRID_API_KEY
          valueFrom:
            secretKeyRef:
              name: sendgrid-api-key
              key: latest
        - name: KAJA_API_KEY
          valueFrom:
            secretKeyRef:
              name: kaja-api-key
              key: latest
        - name: KAJA_API_SECRET
          valueFrom:
            secretKeyRef:
              name: kaja-api-secret
              key: latest
[REDACTED - SECURITY BREACH]
          valueFrom:
            secretKeyRef:
              name: lightspeed-api-key
              key: latest
        - name: LIGHTSPEED_API_SECRET
          valueFrom:
            secretKeyRef:
              name: lightspeed-api-secret
              key: latest
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: latest
        - name: DOORDASH_API_KEY
          valueFrom:
            secretKeyRef:
              name: doordash-api-key
              key: latest
        - name: DOORDASH_API_SECRET
          valueFrom:
            secretKeyRef:
              name: doordash-api-secret
              key: latest
        - name: UBER_API_KEY
          valueFrom:
            secretKeyRef:
              name: uber-api-key
              key: latest
        - name: UBER_API_SECRET
          valueFrom:
            secretKeyRef:
              name: uber-api-secret
              key: latest
        - name: GOOGLE_MAPS_API_KEY
          valueFrom:
            secretKeyRef:
              name: google-maps-api-key
              key: latest
        - name: TWILIO_ACCOUNT_SID
          valueFrom:
            secretKeyRef:
              name: twilio-account-sid
              key: latest
        - name: TWILIO_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: twilio-auth-token
              key: latest
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
          requests:
            cpu: "1"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
      cloudSqlInstances:
      - $PROJECT_ID:$REGION:livhana-integration-db
EOF

echo "✅ Cloud Run configuration created: cloud-run-production.yaml"

# 9. Create deployment script
echo "📋 Creating deployment script..."

cat > "deploy-production.sh" << 'EOF'
#!/bin/bash

# PRODUCTION DEPLOYMENT SCRIPT
# Deploys Liv Hana Integration Service with all production secrets

set -euo pipefail

PROJECT_ID="livhana-empire"
REGION="us-central1"
SERVICE_NAME="integration-service"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying Liv Hana Integration Service to production"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t "$IMAGE_NAME:latest" backend/integration-service/

echo "📤 Pushing image to Artifact Registry..."
docker push "$IMAGE_NAME:latest"

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --image="$IMAGE_NAME:latest" \
    --platform="managed" \
    --allow-unauthenticated \
    --service-account="integration-service-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --memory="2Gi" \
    --cpu="2" \
    --concurrency="1000" \
    --timeout="300" \
    --max-instances="10" \
    --min-instances="1" \
    --execution-environment="gen2" \
    --file="cloud-run-production.yaml"

# Get service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --format="value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "🔍 Next steps:"
echo "1. Test health endpoint: curl $SERVICE_URL/health"
echo "2. Test self-test endpoint: curl $SERVICE_URL/__selftest"
echo "3. Configure webhook URLs in provider dashboards"
echo "4. Set up uptime monitoring"
echo ""
echo "📋 Webhook URLs to configure:"
echo "Veriff: $SERVICE_URL/api/v1/veriff/webhook"
echo "LightSpeed: $SERVICE_URL/api/v1/post-purchase/webhook"
echo ""
EOF

chmod +x deploy-production.sh

echo "✅ Deployment script created: deploy-production.sh"

# 10. Create secret update script
echo "📋 Creating secret update script..."

cat > "update-secrets.sh" << 'EOF'
#!/bin/bash

# SECRET UPDATE SCRIPT
# Updates GCP Secret Manager with real credentials
# Usage: ./update-secrets.sh

set -euo pipefail

PROJECT_ID="livhana-empire"

echo "🔐 Updating Liv Hana production secrets"
echo "Project: $PROJECT_ID"
echo ""

# Function to update secret
update_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    echo "Updating secret: $secret_name"
    echo "$secret_value" | gcloud secrets versions add "$secret_name" \
        --project="$PROJECT_ID" \
        --data-file=-
    echo "✅ Secret $secret_name updated"
    echo ""
}

# Example usage (replace with real values):
# update_secret "veriff-api-key" "your-real-veriff-api-key"
# update_secret "sendgrid-api-key" "your-real-sendgrid-api-key"
# update_secret "db-password" "your-real-db-password"

echo "⚠️  IMPORTANT: Edit this script and add real secret values"
echo "Then run: ./update-secrets.sh"
echo ""
echo "Required secrets to update:"
echo "- veriff-api-key"
echo "- veriff-api-secret"
echo "- sendgrid-api-key"
echo "- kaja-api-key"
echo "- kaja-api-secret"
echo "- lightspeed-api-key"
echo "- lightspeed-api-secret"
echo "- db-password"
echo "- db-user"
echo "- jwt-secret"
echo "- doordash-api-key"
echo "- doordash-api-secret"
echo "- uber-api-key"
echo "- uber-api-secret"
echo "- google-maps-api-key"
echo "- twilio-account-sid"
echo "- twilio-auth-token"
EOF

chmod +x update-secrets.sh

echo "✅ Secret update script created: update-secrets.sh"

echo ""
echo "🎉 Production secrets setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update secrets with real values: ./update-secrets.sh"
echo "2. Deploy to production: ./deploy-production.sh"
echo "3. Configure webhook URLs in provider dashboards"
echo "4. Set up uptime monitoring and alerts"
echo ""
echo "🔍 Files created:"
echo "- cloud-run-production.yaml (Cloud Run configuration)"
echo "- deploy-production.sh (deployment script)"
echo "- update-secrets.sh (secret update script)"
echo ""
echo "⚠️  IMPORTANT: Update all secrets with real values before deployment!"
