#!/bin/bash

# E2E EMPIRE MISSION - COMPLETE GCP PERMISSIONS SETUP
# Grants minimal required permissions for high@reggieanddro.com

set -e

PROJECT_ID="reggieanddrodispensary"
USER_EMAIL="high@reggieanddro.com"

echo "🚀 E2E EMPIRE PERMISSIONS SETUP"
echo "Project: $PROJECT_ID"
echo "User: $USER_EMAIL"
echo ""

# Function to add IAM policy binding
add_permission() {
    local role=$1
    local description=$2
    echo "📋 Adding $role - $description"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="user:$USER_EMAIL" \
        --role="$role" \
        --quiet
    echo "✅ $role added"
}

# Function to add service account permission
add_service_account_permission() {
    local service_account=$1
    local role=$2
    local description=$3
    echo "📋 Adding $role for $service_account - $description"
    gcloud iam service-accounts add-iam-policy-binding "$service_account" \
        --member="user:$USER_EMAIL" \
        --role="$role" \
        --quiet
    echo "✅ $role added for $service_account"
}

echo "🔧 ENABLING REQUIRED APIS..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project="$PROJECT_ID"

echo ""
echo "🎯 CORE DEPLOYMENT PERMISSIONS..."

# Cloud Run Deployment
add_permission "roles/run.admin" "Deploy and manage Cloud Run services"

# Cloud Build
add_permission "roles/cloudbuild.builds.editor" "Build Docker images and deploy services"

# Artifact Registry
add_permission "roles/artifactregistry.reader" "Download Docker images from Artifact Registry"

# Service Account Usage
add_permission "roles/iam.serviceAccountUser" "Act as service accounts for deployments"

echo ""
echo "🌐 DOMAIN MAPPING PERMISSIONS..."

# Domain Mapping
add_permission "roles/run.domainAdmin" "Create and manage domain mappings"

# SSL Certificate Management
add_permission "roles/certificatemanager.certificateViewer" "View SSL certificates"

echo ""
echo "🔐 SECRETS MANAGEMENT..."

# Secret Manager
add_permission "roles/secretmanager.secretAccessor" "Access secrets for service configuration"

echo ""
echo "📊 MONITORING & LOGGING..."

# Cloud Logging
add_permission "roles/logging.logWriter" "Write application logs"

# Cloud Monitoring
add_permission "roles/monitoring.metricWriter" "Write custom metrics"

echo ""
echo "🗄️ DATABASE ACCESS..."

# Cloud SQL
add_permission "roles/cloudsql.client" "Connect to Cloud SQL instances"

# BigQuery
add_permission "roles/bigquery.dataEditor" "Read/write BigQuery data"

echo ""
echo "⚡ QUEUE MANAGEMENT..."

# Cloud Tasks
add_permission "roles/cloudtasks.enqueuer" "Enqueue background tasks"
add_permission "roles/cloudtasks.queueAdmin" "Manage task queues"

echo ""
echo "🔧 SERVICE ACCOUNT SPECIFIC PERMISSIONS..."

# Default Compute Service Account
DEFAULT_SA="${PROJECT_ID}-compute@developer.gserviceaccount.com"
add_service_account_permission "$DEFAULT_SA" "roles/iam.serviceAccountUser" "Use default compute service account"

# Cloud Run Service Account (if exists)
CLOUD_RUN_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
if gcloud iam service-accounts describe "$CLOUD_RUN_SA" --project="$PROJECT_ID" --quiet 2>/dev/null; then
    add_service_account_permission "$CLOUD_RUN_SA" "roles/iam.serviceAccountUser" "Use Cloud Run service account"
else
    echo "⚠️  Cloud Run service account not found, skipping"
fi

echo ""
echo "🎯 E2E EMPIRE SPECIFIC PERMISSIONS..."

# Integration Service Secrets
add_permission "roles/secretmanager.secretAccessor" "Access integration service secrets"

# Voice Service Secrets
add_permission "roles/secretmanager.secretAccessor" "Access voice service secrets"

# Reasoning Gateway Secrets
add_permission "roles/secretmanager.secretAccessor" "Access reasoning gateway secrets"

echo ""
echo "✅ PERMISSIONS SETUP COMPLETE!"
echo ""
echo "📋 SUMMARY OF PERMISSIONS GRANTED:"
echo "✅ Cloud Run Admin - Deploy services"
echo "✅ Cloud Build Editor - Build images"
echo "✅ Artifact Registry Reader - Download images"
echo "✅ Service Account User - Act as service accounts"
echo "✅ Domain Admin - Create domain mappings"
echo "✅ Secret Accessor - Access secrets"
echo "✅ Log Writer - Write logs"
echo "✅ Metric Writer - Write metrics"
echo "✅ Cloud SQL Client - Database access"
echo "✅ BigQuery Editor - Data access"
echo "✅ Cloud Tasks - Background jobs"
echo ""
echo "🚀 READY FOR E2E EMPIRE DEPLOYMENT!"
echo ""
echo "Next steps:"
echo "1. Deploy Cloud Run services"
echo "2. Create domain mappings"
echo "3. Configure SSL certificates"
echo "4. Test E2E Empire functionality"
echo ""
echo "Test deployment:"
echo "gcloud run deploy test-service --source . --region us-central1 --allow-unauthenticated"
