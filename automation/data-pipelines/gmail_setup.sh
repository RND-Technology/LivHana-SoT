#!/bin/bash
#
# Gmail Ingestion Pipeline - Setup Script
#
# This script sets up the Gmail ingestion pipeline:
# 1. Install dependencies
# 2. Configure Google Cloud resources
# 3. Authenticate Gmail accounts
# 4. Run tests
#

set -e  # Exit on error

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Gmail Ingestion Pipeline - Setup"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check required tools
echo "${BLUE}Checking required tools...${NC}"

if ! command -v node &> /dev/null; then
    echo "${RED}Error: Node.js is not installed${NC}"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "${RED}Error: npm is not installed${NC}"
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "${YELLOW}Warning: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    echo "Required for BigQuery and Cloud Storage setup"
fi

if ! command -v bq &> /dev/null; then
    echo "${YELLOW}Warning: bq (BigQuery CLI) is not installed${NC}"
    echo "Install with: gcloud components install bq"
fi

echo "${GREEN}✓ Required tools check complete${NC}"
echo ""

# Get configuration
echo "${BLUE}Configuration:${NC}"
echo ""

read -p "Enter GCP Project ID (or press Enter to skip): " GCP_PROJECT_ID
if [ -n "$GCP_PROJECT_ID" ]; then
    export GCP_PROJECT_ID
    echo "GCP_PROJECT_ID=${GCP_PROJECT_ID}" >> .env.gmail
fi

read -p "Enter BigQuery dataset name [communications]: " BQ_DATASET
BQ_DATASET=${BQ_DATASET:-communications}
export BQ_DATASET
echo "BQ_DATASET=${BQ_DATASET}" >> .env.gmail

read -p "Enter Cloud Storage bucket for attachments [livhana-gmail-attachments]: " GCS_BUCKET
GCS_BUCKET=${GCS_BUCKET:-livhana-gmail-attachments}
export GCS_GMAIL_BUCKET=$GCS_BUCKET
echo "GCS_GMAIL_BUCKET=${GCS_GMAIL_BUCKET}" >> .env.gmail

echo ""
echo "${GREEN}✓ Configuration saved to .env.gmail${NC}"
echo ""

# Install dependencies
echo "${BLUE}Installing dependencies...${NC}"
npm install
echo "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Setup Google Cloud resources
if command -v gcloud &> /dev/null && [ -n "$GCP_PROJECT_ID" ]; then
    echo "${BLUE}Setting up Google Cloud resources...${NC}"

    # Set project
    gcloud config set project "$GCP_PROJECT_ID"

    # Enable APIs
    echo "Enabling Gmail API..."
    gcloud services enable gmail.googleapis.com --quiet || true

    echo "Enabling BigQuery API..."
    gcloud services enable bigquery.googleapis.com --quiet || true

    echo "Enabling Cloud Storage API..."
    gcloud services enable storage-api.googleapis.com --quiet || true

    # Create BigQuery dataset
    if command -v bq &> /dev/null; then
        echo "Creating BigQuery dataset: ${BQ_DATASET}"
        bq mk --dataset \
            --location=US \
            --description="Gmail communications data" \
            "${GCP_PROJECT_ID}:${BQ_DATASET}" 2>/dev/null || true

        echo "Creating BigQuery tables..."
        bq query --use_legacy_sql=false < gmail_bigquery_schema.sql || true
    fi

    # Create Cloud Storage bucket
    if command -v gsutil &> /dev/null; then
        echo "Creating Cloud Storage bucket: ${GCS_BUCKET}"
        gsutil mb -l us -c STANDARD "gs://${GCS_BUCKET}" 2>/dev/null || true
    fi

    echo "${GREEN}✓ Google Cloud resources setup complete${NC}"
else
    echo "${YELLOW}Skipping Google Cloud setup (gcloud not installed or project not specified)${NC}"
fi
echo ""

# Check for credentials
echo "${BLUE}Checking OAuth credentials...${NC}"

CREDS_MISSING=0

if [ ! -f "gmail_credentials_jessen.json" ]; then
    echo "${YELLOW}⚠ Missing: gmail_credentials_jessen.json${NC}"
    CREDS_MISSING=1
fi

if [ ! -f "gmail_credentials_high.json" ]; then
    echo "${YELLOW}⚠ Missing: gmail_credentials_high.json${NC}"
    CREDS_MISSING=1
fi

if [ $CREDS_MISSING -eq 1 ]; then
    echo ""
    echo "${YELLOW}OAuth credentials not found.${NC}"
    echo ""
    echo "To get credentials:"
    echo "1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "2. Create OAuth 2.0 Client ID (Desktop app)"
    echo "3. Download JSON credentials"
    echo "4. Save as:"
    echo "   - gmail_credentials_jessen.json (for jesseniesen@gmail.com)"
    echo "   - gmail_credentials_high.json (for high@reggieanddro.com)"
    echo ""
else
    echo "${GREEN}✓ OAuth credentials found${NC}"
fi
echo ""

# Authenticate accounts
echo "${BLUE}Gmail Account Authentication:${NC}"
echo ""
echo "You need to authenticate each Gmail account."
echo "This will open your browser for OAuth consent."
echo ""

read -p "Authenticate jesseniesen@gmail.com? (y/n): " AUTH_JESSEN
if [[ $AUTH_JESSEN == "y" || $AUTH_JESSEN == "Y" ]]; then
    node gmail_auth.js --account=jesseniesen || true
fi

echo ""
read -p "Authenticate high@reggieanddro.com? (y/n): " AUTH_HIGH
if [[ $AUTH_HIGH == "y" || $AUTH_HIGH == "Y" ]]; then
    node gmail_auth.js --account=high || true
fi

echo ""

# Run tests
echo "${BLUE}Running tests...${NC}"
node gmail_test.js || true
echo ""

# Summary
echo ""
echo "═══════════════════════════════════════════════════════"
echo "${GREEN}Setup Complete!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. If you haven't authenticated accounts, run:"
echo "   ${BLUE}npm run gmail:auth:jessen${NC}"
echo "   ${BLUE}npm run gmail:auth:high${NC}"
echo ""
echo "2. Run a test ingestion:"
echo "   ${BLUE}npm run gmail:ingest -- --max=10${NC}"
echo ""
echo "3. Run full ingestion:"
echo "   ${BLUE}npm run gmail:ingest:full${NC}"
echo ""
echo "4. Run tests:"
echo "   ${BLUE}npm run gmail:test${NC}"
echo ""
echo "See GMAIL_INGEST_README.md for full documentation."
echo ""

# Last updated: 2025-10-02
