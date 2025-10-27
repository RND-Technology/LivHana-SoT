#!/usr/bin/env bash

###############################################################################
# MUSIC HUB IGNITION - AUTOMATED DEPLOYMENT SCRIPT
###############################################################################
#
# PURPOSE: Deploy 63-domain redirect architecture + landing page
# MISSION: "Grow Sell Heal" SEO flywheel implementation
# TARGET: music.livhana.ai
# ARCHITECTURE: Cloudflare 301 redirects + Static HTML landing page
#
# USAGE:
#   ./deploy-music-hub.sh --full          # Full deployment (Cloudflare + GCP)
#   ./deploy-music-hub.sh --cloudflare    # Cloudflare redirects only
#   ./deploy-music-hub.sh --gcp           # GCP Cloud Run deployment only
#   ./deploy-music-hub.sh --generate-csv  # Generate Cloudflare CSV from YAML
#   ./deploy-music-hub.sh --validate      # Validation checks only
#   ./deploy-music-hub.sh --rollback      # Emergency rollback
#
# REQUIREMENTS:
#   - yq (YAML parser)
#   - curl
#   - gcloud CLI (for GCP deployment)
#   - Cloudflare API token (for API deployment)
#
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
INFRA_DIR="${SCRIPT_DIR}"
YAML_FILE="${INFRA_DIR}/cloudflare-redirect-rules.yaml"
CSV_FILE="${INFRA_DIR}/cloudflare-redirects.csv"
HTML_FILE="${INFRA_DIR}/music-hub-landing.html"
AGE_GATE_FILE="${INFRA_DIR}/age-gate-modal.html"

# Deployment Config
TARGET_DOMAIN="music.livhana.ai"
GCP_PROJECT="${GCP_PROJECT:-livhana-trinity}"
GCP_REGION="${GCP_REGION:-us-central1}"
CLOUDFLARE_LIST_NAME="music-hub-ignition-63-domains"
CLOUDFLARE_RULE_NAME="music-hub-301-redirects"

# Exception list (domains NOT to redirect)
EXCEPTION_DOMAINS=(
    "reggieanddro.com"
    "oneplantsolution.com"
    "highnooncartoon.com"
    "herbitrage.com"
    "exoticcanopysolutions.com"
    "reggieandrosocialclub.com"
)

###############################################################################
# UTILITY FUNCTIONS
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

check_dependencies() {
    log_info "Checking dependencies..."

    local missing_deps=()

    if ! command -v yq &> /dev/null; then
        missing_deps+=("yq")
    fi

    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi

    if ! command -v gcloud &> /dev/null && [[ "$MODE" == "gcp" || "$MODE" == "full" ]]; then
        missing_deps+=("gcloud")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Install with: brew install yq curl google-cloud-sdk"
        exit 1
    fi

    log_success "All dependencies installed"
}

check_files() {
    log_info "Checking required files..."

    if [ ! -f "$YAML_FILE" ]; then
        log_error "YAML file not found: $YAML_FILE"
        exit 1
    fi

    if [ ! -f "$HTML_FILE" ]; then
        log_error "Landing page not found: $HTML_FILE"
        exit 1
    fi

    if [ ! -f "$AGE_GATE_FILE" ]; then
        log_error "Age gate modal not found: $AGE_GATE_FILE"
        exit 1
    fi

    log_success "All required files found"
}

###############################################################################
# CSV GENERATION FROM YAML
###############################################################################

generate_csv() {
    log_section "GENERATING CLOUDFLARE CSV FROM YAML"

    if [ ! -f "$YAML_FILE" ]; then
        log_error "YAML file not found: $YAML_FILE"
        exit 1
    fi

    log_info "Parsing YAML and generating CSV..."

    # CSV Header
    cat > "$CSV_FILE" <<EOF
source_url,target_url,status_code,preserve_path,preserve_query_string,include_subdomains,subpath_matching,comment
EOF

    # Parse YAML and convert to CSV
    yq eval '.redirects[] | [.source, .target, .status, .preserve_path, .preserve_query, "false", "true", .comment] | @csv' "$YAML_FILE" >> "$CSV_FILE"

    local redirect_count=$(tail -n +2 "$CSV_FILE" | wc -l | tr -d ' ')

    log_success "CSV generated: $CSV_FILE"
    log_info "Total redirects: $redirect_count"

    # Validate CSV
    if [ "$redirect_count" -ne 63 ]; then
        log_warning "Expected 63 redirects, found $redirect_count"
    fi

    echo ""
    log_info "CSV Preview (first 5 lines):"
    head -n 6 "$CSV_FILE"
    echo ""
}

###############################################################################
# CLOUDFLARE DEPLOYMENT
###############################################################################

deploy_cloudflare() {
    log_section "DEPLOYING CLOUDFLARE REDIRECTS"

    # Check for Cloudflare API token
    if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
        log_warning "CLOUDFLARE_API_TOKEN not set"
        log_info "Manual deployment required:"
        echo ""
        echo "  1. Log into Cloudflare Dashboard"
        echo "  2. Navigate to: Bulk Redirects"
        echo "  3. Create List: $CLOUDFLARE_LIST_NAME"
        echo "  4. Upload CSV: $CSV_FILE"
        echo "  5. Create Rule: $CLOUDFLARE_RULE_NAME"
        echo "  6. Enable Rule"
        echo ""
        log_info "CSV file ready at: $CSV_FILE"
        return 0
    fi

    log_info "Cloudflare API token found - automated deployment"

    # TODO: Implement Cloudflare API deployment
    # This requires Cloudflare account ID and zone ID
    # For now, provide manual instructions

    log_warning "Automated Cloudflare API deployment not yet implemented"
    log_info "Please deploy manually via Cloudflare Dashboard"
}

###############################################################################
# GCP CLOUD RUN DEPLOYMENT
###############################################################################

deploy_gcp() {
    log_section "DEPLOYING TO GCP CLOUD RUN"

    # Check GCP authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Not authenticated with GCP"
        log_info "Run: gcloud auth login"
        exit 1
    fi

    log_info "Authenticated with GCP"

    # Set GCP project
    gcloud config set project "$GCP_PROJECT"

    # Create deployment directory
    local deploy_dir="${INFRA_DIR}/deploy"
    mkdir -p "$deploy_dir"

    # Copy HTML files
    cp "$HTML_FILE" "$deploy_dir/index.html"
    cp "$AGE_GATE_FILE" "$deploy_dir/age-gate-modal.html"

    # Create Dockerfile
    cat > "$deploy_dir/Dockerfile" <<'EOF'
FROM nginx:alpine

# Copy HTML files
COPY index.html /usr/share/nginx/html/
COPY age-gate-modal.html /usr/share/nginx/html/

# Create nginx config
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
    \
    # Cache static assets \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
EOF

    log_info "Building Docker image..."
    cd "$deploy_dir"
    gcloud builds submit --tag "gcr.io/${GCP_PROJECT}/music-hub:latest"

    log_info "Deploying to Cloud Run..."
    gcloud run deploy music-hub \
        --image "gcr.io/${GCP_PROJECT}/music-hub:latest" \
        --platform managed \
        --region "$GCP_REGION" \
        --allow-unauthenticated \
        --port 8080 \
        --memory 256Mi \
        --cpu 1 \
        --max-instances 10 \
        --min-instances 1 \
        --set-env-vars "TARGET_DOMAIN=${TARGET_DOMAIN}"

    log_info "Mapping custom domain..."
    gcloud run domain-mappings create \
        --service music-hub \
        --domain "$TARGET_DOMAIN" \
        --region "$GCP_REGION" || log_warning "Domain mapping may already exist"

    log_success "GCP deployment complete"
    log_info "Service URL: https://${TARGET_DOMAIN}"

    # Cleanup
    cd "$SCRIPT_DIR"
    rm -rf "$deploy_dir"
}

###############################################################################
# VALIDATION
###############################################################################

validate_deployment() {
    log_section "VALIDATING DEPLOYMENT"

    log_info "Testing target domain: $TARGET_DOMAIN"

    # Test if domain is reachable
    if curl -s -o /dev/null -w "%{http_code}" "https://${TARGET_DOMAIN}" | grep -q "200"; then
        log_success "Target domain is live and returning 200 OK"
    else
        log_error "Target domain not responding correctly"
        return 1
    fi

    # Test sample redirects
    log_info "Testing sample redirects..."

    local sample_domains=(
        "reggieanddroalice.com"
        "highnooncartoon.com"
        "thcasanantonio.com"
        "cannabiscookiestexas.com"
        "ageverifysi.com"
    )

    local passed=0
    local failed=0

    for domain in "${sample_domains[@]}"; do
        local redirect_url=$(curl -s -o /dev/null -w "%{redirect_url}" -L "https://${domain}" || echo "")

        if [[ "$redirect_url" == *"$TARGET_DOMAIN"* ]]; then
            log_success "✓ $domain → $TARGET_DOMAIN"
            ((passed++))
        else
            log_error "✗ $domain - redirect failed"
            ((failed++))
        fi
    done

    echo ""
    log_info "Validation Results: $passed passed, $failed failed"

    if [ $failed -eq 0 ]; then
        log_success "All validation tests passed!"
        return 0
    else
        log_warning "Some validation tests failed"
        return 1
    fi
}

###############################################################################
# ROLLBACK
###############################################################################

rollback_deployment() {
    log_section "ROLLING BACK DEPLOYMENT"

    log_warning "This will disable Cloudflare redirects"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi

    log_info "To rollback Cloudflare redirects:"
    echo "  1. Log into Cloudflare Dashboard"
    echo "  2. Navigate to: Bulk Redirects"
    echo "  3. Find rule: $CLOUDFLARE_RULE_NAME"
    echo "  4. Click 'Disable'"

    log_info "To rollback GCP deployment:"
    echo "  gcloud run services delete music-hub --region $GCP_REGION --quiet"

    log_warning "Manual rollback steps provided above"
}

###############################################################################
# MAIN EXECUTION
###############################################################################

show_usage() {
    cat <<EOF
Usage: $0 [OPTIONS]

OPTIONS:
    --full          Full deployment (Cloudflare + GCP)
    --cloudflare    Deploy Cloudflare redirects only
    --gcp           Deploy to GCP Cloud Run only
    --generate-csv  Generate Cloudflare CSV from YAML
    --validate      Run validation checks only
    --rollback      Emergency rollback
    --help          Show this help message

EXAMPLES:
    $0 --full               # Complete deployment
    $0 --generate-csv       # Generate CSV for manual upload
    $0 --validate           # Test redirects

ENVIRONMENT VARIABLES:
    GCP_PROJECT             GCP project ID (default: livhana-trinity)
    GCP_REGION              GCP region (default: us-central1)
    CLOUDFLARE_API_TOKEN    Cloudflare API token for automation

BATTLE CRY: "Grow baby grow and Sell baby Sell — Stay TOONED!"
EOF
}

main() {
    local MODE="${1:-}"

    if [ -z "$MODE" ]; then
        show_usage
        exit 1
    fi

    case "$MODE" in
        --full)
            log_section "MUSIC HUB IGNITION - FULL DEPLOYMENT"
            echo "Target: $TARGET_DOMAIN"
            echo "Redirects: 63 domains"
            echo "Battle Cry: Grow baby grow and Sell baby Sell — Stay TOONED!"
            echo ""

            check_dependencies
            check_files
            generate_csv
            deploy_cloudflare
            deploy_gcp
            validate_deployment

            log_section "DEPLOYMENT COMPLETE"
            log_success "Music Hub Ignition deployed successfully!"
            ;;

        --cloudflare)
            check_dependencies
            check_files
            generate_csv
            deploy_cloudflare
            ;;

        --gcp)
            check_dependencies
            check_files
            deploy_gcp
            ;;

        --generate-csv)
            check_dependencies
            check_files
            generate_csv
            ;;

        --validate)
            validate_deployment
            ;;

        --rollback)
            rollback_deployment
            ;;

        --help)
            show_usage
            ;;

        *)
            log_error "Unknown option: $MODE"
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"
