#!/bin/bash
# FIX MISSING ROUTES - Update domain mappings to point to correct Cloud Run service
set -euo pipefail

echo "🔧 FIXING MISSING CLOUD RUN ROUTES"
echo "==================================="
echo ""

PROJECT="reggieanddrodispensary"
REGION="us-central1"
SERVICE="integration-service"

# Domains with missing or incorrect routes
DOMAINS_TO_FIX=(
    "freeweedtexas.com"
    "highfromhemp.com"
    "jesseniesen.com"
    "oneplantsolution.com"
    "smokingyoga.com"
    "thcacannabisdispensary.com"
    "thcaflowertx.com"
    "thcasanantonio.com"
)

# Special case: herbitrage.com mapped to cockpit-ui (should be cockpit)
HERBITRAGE_DOMAIN="herbitrage.com"
HERBITRAGE_SERVICE="cockpit"

echo "🎯 Fixing ${#DOMAINS_TO_FIX[@]} domains with missing routes..."
echo ""

# Function to delete and recreate domain mapping
fix_domain_mapping() {
    local domain="$1"
    local service="$2"

    echo "📝 Fixing $domain → $service..."

    # Delete existing mapping (if exists)
    echo "  🗑️  Deleting old mapping..."
    gcloud beta run domain-mappings delete "$domain" \
        --region "$REGION" \
        --project "$PROJECT" \
        --quiet 2>&1 | grep -v "Waiting" || echo "  (No existing mapping)"

    sleep 2

    # Create new mapping to correct service
    echo "  ✅ Creating new mapping..."
    gcloud beta run domain-mappings create \
        --service "$service" \
        --domain "$domain" \
        --region "$REGION" \
        --project "$PROJECT" 2>&1 | grep -v "Waiting" | head -5

    echo "  ✅ $domain mapped to $service"
    echo ""
}

# Fix all domains with missing routes
for domain in "${DOMAINS_TO_FIX[@]}"; do
    fix_domain_mapping "$domain" "$SERVICE"
    sleep 3  # Rate limiting
done

# Fix herbitrage.com separately (different service)
echo "📝 Fixing special case: $HERBITRAGE_DOMAIN → $HERBITRAGE_SERVICE..."
echo "  🗑️  Deleting old mapping..."
gcloud beta run domain-mappings delete "$HERBITRAGE_DOMAIN" \
    --region "$REGION" \
    --project "$PROJECT" \
    --quiet 2>&1 | grep -v "Waiting" || echo "  (No existing mapping)"

sleep 2

echo "  ✅ Creating new mapping..."
gcloud beta run domain-mappings create \
    --service "$HERBITRAGE_SERVICE" \
    --domain "$HERBITRAGE_DOMAIN" \
    --region "$REGION" \
    --project "$PROJECT" 2>&1 | grep -v "Waiting" | head -5

echo "  ✅ $HERBITRAGE_DOMAIN mapped to $HERBITRAGE_SERVICE"
echo ""

echo "✅ ROUTE FIXES COMPLETE"
echo ""
echo "📊 Summary:"
echo "  - Fixed: ${#DOMAINS_TO_FIX[@]} domains → $SERVICE"
echo "  - Fixed: $HERBITRAGE_DOMAIN → $HERBITRAGE_SERVICE"
echo "  - Status: Certificate provisioning will begin after DNS update"
echo ""
echo "🔍 Verify mappings:"
echo "  gcloud beta run domain-mappings list --region $REGION --project $PROJECT"
echo ""
echo "⏭️  Next step: Update DNS to Cloud Run IPs"
echo "  ./.claude/update-dns-to-cloud-run.sh"
