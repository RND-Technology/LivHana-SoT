#!/bin/bash

# ECWID CATEGORY FIX - EXECUTE NOW
# Uses credentials from .env.ecwid

set -e

echo "🚀 Starting Ecwid Category Box Fix"
echo ""

# Load credentials
if [ -f .env.ecwid ]; then
  source .env.ecwid
  echo "✅ Loaded credentials from .env.ecwid"
else
  echo "❌ Missing .env.ecwid file"
  exit 1
fi

# Verify credentials
if [ -z "$ECWID_STORE_ID" ] || [ -z "$ECWID_API_TOKEN" ]; then
  echo "❌ Missing ECWID_STORE_ID or ECWID_API_TOKEN"
  exit 1
fi

echo "📊 Store ID: $ECWID_STORE_ID"
echo "🔑 Token: ${ECWID_API_TOKEN:0:20}..."
echo ""

# Run fix
echo "💉 Executing category box fix..."
export ECWID_STORE_ID
export ECWID_API_TOKEN

node automation/ecwid-api-client.js

echo ""
echo "✅ DONE!"
echo ""
echo "⚠️  SECURITY: Regenerate API token after testing"
echo "   Go to: https://my.ecwid.com/cp/ → Apps → Custom app → Regenerate token"
echo ""
