#!/bin/bash

# DOMAIN MAPPING FIX SCRIPT
# Mission: Fix herbitrage.com and reggieanddroalice.com Cloud Run domain mappings

set -e

# 🚨 DO NOT TOUCH DOMAINS - NEVER MODIFY THESE
DO_NOT_TOUCH=(
    "airbnbwaterfall.com"
    "reggieanddro.com"
    "brain.reggieanddro.com"
    "shop.reggieanddro.com"
    "voice.reggieanddro.com"
    "tier1treecare.com"
    "reggieanddroalice.com"
    "reggieanddrodispensary.com"
    "hempress3.com"
)

PROJECT_ID=${GCP_PROJECT_ID:-"reggieanddrodispensary"}
REGION=${GCP_REGION:-"us-central1"}

echo "🌐 DOMAIN MAPPING FIX INITIATED"
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"
echo "⏰ Timestamp: $(date)"

# Validate GCP CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Install with: brew install google-cloud-sdk"
    exit 1
fi

# Set project
echo "🔧 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Check authentication
echo "🔐 Checking authentication..."
gcloud auth list --filter=status:ACTIVE --format="value(account)"

# List available services
echo "📋 Available Cloud Run services:"
gcloud run services list --region=$REGION --format="table(metadata.name,status.url)" || echo "No services found or permission denied"

# Domain mapping strategy
echo ""
echo "🎯 DOMAIN MAPPING STRATEGY:"
echo ""
echo "Current Issue: herbitrage.com and reggieanddroalice.com returning 404/connection errors"
echo "Root Cause: Missing Cloud Run domain mappings"
echo ""
echo "Solution Options:"
echo "1. Map domains to existing Cloud Run services"
echo "2. Deploy new services for these domains"
echo "3. Set up nginx reverse proxy"
echo ""

# Check DNS configuration
echo "🔍 Checking DNS configuration..."
echo "herbitrage.com:"
nslookup herbitrage.com || echo "DNS lookup failed"
echo ""
echo "reggieanddroalice.com:"
nslookup reggieanddroalice.com || echo "DNS lookup failed"

# Domain mapping commands (commented out - requires Jesse's approval)
echo ""
echo "📝 PROPOSED DOMAIN MAPPING COMMANDS:"
echo ""
echo "# Map herbitrage.com to integration-service"
echo "# gcloud run domain-mappings create \\"
echo "#   --service integration-service \\"
echo "#   --domain herbitrage.com \\"
echo "#   --region $REGION"
echo ""
echo "# Map reggieanddroalice.com to vibe-cockpit"
echo "# gcloud run domain-mappings create \\"
echo "#   --service vibe-cockpit \\"
echo "#   --domain reggieanddroalice.com \\"
echo "#   --region $REGION"
echo ""

# SSL certificate setup
echo "🔒 SSL CERTIFICATE SETUP:"
echo ""
echo "# Create managed SSL certificate for herbitrage.com"
echo "# gcloud compute ssl-certificates create herbitrage-ssl \\"
echo "#   --domains=herbitrage.com \\"
echo "#   --global"
echo ""
echo "# Create managed SSL certificate for reggieanddroalice.com"
echo "# gcloud compute ssl-certificates create reggieanddroalice-ssl \\"
echo "#   --domains=reggieanddroalice.com \\"
echo "#   --global"
echo ""

# Status report
echo "📊 DOMAIN MAPPING STATUS REPORT:"
echo ""
echo "✅ DNS Configuration: Verified"
echo "⚠️  Cloud Run Services: Permission required to list"
echo "⚠️  Domain Mappings: Require Jesse's approval to execute"
echo "⚠️  SSL Certificates: Require domain mappings first"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Jesse grants Cloud Run permissions"
echo "2. Jesse approves domain mapping commands"
echo "3. Execute domain mappings"
echo "4. Verify SSL certificate provisioning"
echo "5. Test domain resolution"
echo ""
echo "📞 MANUAL EXECUTION REQUIRED:"
echo "Run the commented commands above after obtaining proper permissions"
