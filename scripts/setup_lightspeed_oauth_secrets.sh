#!/usr/bin/env bash
# Setup LightSpeed OAuth2 Secrets in GCP Secret Manager
# This script stores CLIENT_ID, CLIENT_SECRET, and ACCOUNT_ID securely

set -euo pipefail

GCP_PROJECT="${GCP_PROJECT_ID:-reggieanddrodispensary}"
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  🔐 LIGHTSPEED OAUTH2 SECRET SETUP${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}GCP Project:${NC} $GCP_PROJECT"
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  No active gcloud authentication${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

echo -e "${GREEN}✅ gcloud authenticated${NC}"
echo ""

# Function to store or update secret
store_secret() {
    local secret_name="$1"
    local secret_value="$2"
    local description="$3"

    echo -e "${CYAN}🔐 Storing: ${secret_name}${NC}"

    # Check if secret exists
    if gcloud secrets describe "$secret_name" --project="$GCP_PROJECT" >/dev/null 2>&1; then
        echo "   Secret exists - adding new version"
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" \
            --data-file=- \
            --project="$GCP_PROJECT"
    else
        echo "   Creating new secret"
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --project="$GCP_PROJECT" \
            --replication-policy="automatic"

        # Add labels
        gcloud secrets update "$secret_name" \
            --update-labels="service=lightspeed,type=oauth2,managed-by=liv-hana" \
            --project="$GCP_PROJECT" >/dev/null 2>&1 || true
    fi

    echo -e "${GREEN}   ✅ ${secret_name} stored${NC}"
    echo ""
}

# Prompt for credentials
echo -e "${BOLD}Enter LightSpeed OAuth2 Credentials:${NC}"
echo ""

read -p "CLIENT_ID: " CLIENT_ID
if [[ -z "$CLIENT_ID" ]]; then
    echo -e "${YELLOW}⚠️  CLIENT_ID cannot be empty${NC}"
    exit 1
fi

read -sp "CLIENT_SECRET: " CLIENT_SECRET
echo ""
if [[ -z "$CLIENT_SECRET" ]]; then
    echo -e "${YELLOW}⚠️  CLIENT_SECRET cannot be empty${NC}"
    exit 1
fi

read -p "ACCOUNT_ID: " ACCOUNT_ID
if [[ -z "$ACCOUNT_ID" ]]; then
    echo -e "${YELLOW}⚠️  ACCOUNT_ID cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Confirm Credentials${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}CLIENT_ID:${NC}     $CLIENT_ID"
echo -e "${CYAN}CLIENT_SECRET:${NC} ${CLIENT_SECRET:0:4}****${CLIENT_SECRET: -4}"
echo -e "${CYAN}ACCOUNT_ID:${NC}    $ACCOUNT_ID"
echo ""

read -p "Store these credentials in GCP Secret Manager? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Storing Secrets${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

store_secret "LIGHTSPEED_CLIENT_ID" "$CLIENT_ID" "LightSpeed OAuth2 Client ID"
store_secret "LIGHTSPEED_CLIENT_SECRET" "$CLIENT_SECRET" "LightSpeed OAuth2 Client Secret"
store_secret "LIGHTSPEED_ACCOUNT_ID" "$ACCOUNT_ID" "LightSpeed Account ID"

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  ✅ SETUP COMPLETE${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}All three secrets stored successfully!${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Run: claude-tier1"
echo "  2. Integration service will auto-start with OAuth2"
echo "  3. Complete authorization: open http://localhost:3005/auth/lightspeed/start"
echo "  4. Verify: curl http://localhost:3005/health | jq '.lightspeed_auth'"
echo ""

# Verify secrets are accessible
echo -e "${CYAN}Verifying secrets are accessible...${NC}"
for secret in LIGHTSPEED_CLIENT_ID LIGHTSPEED_CLIENT_SECRET LIGHTSPEED_ACCOUNT_ID; do
    if gcloud secrets versions access latest --secret="$secret" --project="$GCP_PROJECT" >/dev/null 2>&1; then
        echo -e "${GREEN}  ✅ $secret${NC}"
    else
        echo -e "${YELLOW}  ⚠️  $secret (failed to verify)${NC}"
    fi
done

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
