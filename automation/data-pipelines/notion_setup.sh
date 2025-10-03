#!/bin/bash

# Notion Ingestion Setup Script
# This script helps you set up and run the Notion ingestion pipeline

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.notion"

echo "======================================"
echo "Notion Ingestion Pipeline Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Node.js version must be 16 or higher"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd "$SCRIPT_DIR"
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Check for environment variables
if [ -f "$ENV_FILE" ]; then
    echo "📄 Found .env.notion file"
    source "$ENV_FILE"
else
    echo "⚠️  No .env.notion file found"
    echo ""
fi

# Validate required environment variables
if [ -z "$NOTION_API_KEY" ]; then
    echo "❌ Error: NOTION_API_KEY is not set"
    echo ""
    echo "Please set your Notion API key:"
    echo "1. Create an integration at https://www.notion.so/my-integrations"
    echo "2. Copy the 'Internal Integration Token'"
    echo "3. Share your workspace pages with the integration"
    echo "4. Set the environment variable:"
    echo "   export NOTION_API_KEY=secret_yourkey"
    echo ""
    echo "Or create a .env.notion file:"
    echo "   cp .env.notion.example .env.notion"
    echo "   # Edit .env.notion and add your key"
    exit 1
fi

echo "✅ NOTION_API_KEY is set"

# Check GCP credentials
if [ -n "$GCP_PROJECT_ID" ]; then
    echo "✅ GCP_PROJECT_ID: $GCP_PROJECT_ID"
elif [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "✅ Using GOOGLE_APPLICATION_CREDENTIALS"
else
    echo "⚠️  No GCP_PROJECT_ID set, using default credentials"
fi

# Check BigQuery dataset
BQ_DATASET=${BQ_DATASET:-knowledge}
echo "✅ BigQuery dataset: $BQ_DATASET"

echo ""
echo "======================================"
echo "Configuration Complete"
echo "======================================"
echo ""

# Create export directory
EXPORT_DIR="$SCRIPT_DIR/../../data/notion_export"
mkdir -p "$EXPORT_DIR"
echo "📁 Export directory: $EXPORT_DIR"
echo ""

# Ask user if they want to run the ingestion
read -p "Run the ingestion now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "======================================"
    echo "Starting Notion Ingestion"
    echo "======================================"
    echo ""

    # Run the ingestion
    npm run notion:ingest

    EXIT_CODE=$?
    echo ""

    if [ $EXIT_CODE -eq 0 ]; then
        echo "======================================"
        echo "✅ Ingestion Complete!"
        echo "======================================"
        echo ""
        echo "Check the output:"
        echo "  - Markdown files: $EXPORT_DIR"
        echo "  - BigQuery table: $BQ_DATASET.notion_pages"
        echo ""
    else
        echo "======================================"
        echo "❌ Ingestion Failed"
        echo "======================================"
        echo ""
        echo "Check the logs above for error details"
        exit $EXIT_CODE
    fi
else
    echo ""
    echo "To run the ingestion later:"
    echo "  npm run notion:ingest"
    echo ""
    echo "Or directly:"
    echo "  node notion_ingest.js"
    echo ""
fi

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02
