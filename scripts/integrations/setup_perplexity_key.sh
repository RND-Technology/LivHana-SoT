#!/bin/bash
# Setup Perplexity API Key for Liv Hana TRUTH Pipeline
# Run this script after obtaining API key from https://www.perplexity.ai/settings/api

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔬 PERPLEXITY API KEY SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Check if 1Password CLI is available
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI not found. Install with: brew install 1password-cli"
    exit 1
fi

# Check if signed in
if ! op account list &> /dev/null; then
    echo "🔐 Signing into 1Password..."
    eval $(op signin)
fi

# Prompt for API key
echo "📝 Enter your Perplexity API key (starts with 'pplx-'):"
read -s PERPLEXITY_API_KEY
echo

# Validate format
if [[ ! "$PERPLEXITY_API_KEY" =~ ^pplx-.+ ]]; then
    echo "❌ Invalid API key format. Must start with 'pplx-'"
    exit 1
fi

# Store in 1Password
echo "💾 Storing in 1Password vault: LivHana-Secrets..."
op item create \
  --category="API Credential" \
  --title="Perplexity API Key" \
  --vault="LivHana-Secrets" \
  credential="$PERPLEXITY_API_KEY" \
  notes="Research Agent API key for TRUTH pipeline verification" \
  || echo "⚠️  Item may already exist. Updating..."

# Also store in GCP Secret Manager
echo "☁️  Storing in GCP Secret Manager..."
echo -n "$PERPLEXITY_API_KEY" | gcloud secrets create perplexity-api-key \
  --project=reggieanddrodispensary \
  --replication-policy=automatic \
  --data-file=- \
  2>/dev/null || \
echo -n "$PERPLEXITY_API_KEY" | gcloud secrets versions add perplexity-api-key \
  --project=reggieanddrodispensary \
  --data-file=-

# Test the key
echo "🧪 Testing API key..."
response=$(curl -s -X POST https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sonar-pro",
    "messages": [{"role": "user", "content": "Test"}],
    "max_tokens": 10
  }')

if echo "$response" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
    echo "✅ API key valid and working!"
else
    echo "❌ API key test failed. Response:"
    echo "$response" | jq '.'
    exit 1
fi

# Add to local .env (for development)
echo "📝 Adding to .env.local..."
if [ -f .env.local ]; then
    if grep -q "PERPLEXITY_API_KEY" .env.local; then
        sed -i.bak "s/^PERPLEXITY_API_KEY=.*/PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY/" .env.local
        rm .env.local.bak
    else
        echo "PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY" >> .env.local
    fi
else
    echo "PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY" > .env.local
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ PERPLEXITY API KEY CONFIGURED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "🎯 Next Steps:"
echo "  1. Restart Claude Tier-1: ./scripts/claude_tier1_boot.sh"
echo "  2. Test Research Agent: ./scripts/start_research_agent.sh"
echo "  3. Run TRUTH Pipeline: ./scripts/step_perplexity_verify.sh"
echo
echo "📚 Documentation: docs/PERPLEXITY_OPTIMIZATION_GUIDE.md"
echo
