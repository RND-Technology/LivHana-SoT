#!/usr/bin/env bash
# MCP Broker Deployment Script
# Deploys MCP Broker to Google Cloud Run
# Compliance: LifeWard standard, 21+ age-gate, NIST methods

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
CONFIG_FILE="$ROOT/config/mcp_broker_config.json"
LOG_FILE="$ROOT/logs/mcp_broker_deployment.log"

# Ensure directories exist
mkdir -p "$ROOT/logs"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Configuration validation
validate_config() {
    local config_file="$1"
    
    if [[ ! -f "$config_file" ]]; then
        log "ERROR: Configuration file not found: $config_file"
        return 1
    fi
    
    # Validate JSON structure
    if ! jq empty "$config_file" >/dev/null 2>&1; then
        log "ERROR: Invalid JSON in configuration file"
        return 1
    fi
    
    # Validate required fields
    local required_fields=("version" "deployment" "endpoints" "authentication")
    for field in "${required_fields[@]}"; do
        if ! jq -e ".mcp_broker.$field" "$config_file" >/dev/null 2>&1; then
            log "ERROR: Missing required field: $field"
            return 1
        fi
    done
    
    log "Configuration validation passed"
    return 0
}

# Environment setup
setup_environment() {
    log "Setting up deployment environment..."
    
    # Check if gcloud is installed
    if ! command -v gcloud >/dev/null 2>&1; then
        log "ERROR: gcloud CLI not found. Please install Google Cloud SDK."
        return 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log "ERROR: No active gcloud authentication found."
        log "Please run: gcloud auth login"
        return 1
    fi
    
    # Get project ID
    local project_id
    project_id=$(gcloud config get-value project 2>/dev/null || echo "")
    if [[ -z "$project_id" ]]; then
        log "ERROR: No Google Cloud project set."
        log "Please run: gcloud config set project YOUR_PROJECT_ID"
        return 1
    fi
    
    log "Using project: $project_id"
    echo "$project_id"
}

# Docker image build
build_docker_image() {
    local project_id="$1"
    local service_name
    service_name=$(jq -r '.mcp_broker.deployment.service_name' "$CONFIG_FILE")
    local image_name="gcr.io/$project_id/$service_name"
    
    log "Building Docker image: $image_name"
    
    # Create Dockerfile if it doesn't exist
    local dockerfile="$ROOT/Dockerfile.mcp_broker"
    if [[ ! -f "$dockerfile" ]]; then
        cat > "$dockerfile" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY mcp_broker/ ./mcp_broker/
COPY config/ ./config/

# Set environment variables
ENV PORT=8080
ENV PYTHONPATH=/app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Run the application
CMD ["python", "-m", "mcp_broker.main"]
EOF
    fi
    
    # Create requirements.txt if it doesn't exist
    local requirements="$ROOT/requirements.txt"
    if [[ ! -f "$requirements" ]]; then
        cat > "$requirements" << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
httpx==0.25.2
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
redis==5.0.1
EOF
    fi
    
    # Build and push image
    log "Building Docker image..."
    if docker build -f "$dockerfile" -t "$image_name" "$ROOT"; then
        log "Docker image built successfully"
    else
        log "ERROR: Docker image build failed"
        return 1
    fi
    
    log "Pushing Docker image to registry..."
    if docker push "$image_name"; then
        log "Docker image pushed successfully"
    else
        log "ERROR: Docker image push failed"
        return 1
    fi
    
    echo "$image_name"
}

# Cloud Run deployment
deploy_to_cloud_run() {
    local project_id="$1"
    local image_name="$2"
    
    log "Deploying to Google Cloud Run..."
    
    # Get deployment configuration
    local service_name
    service_name=$(jq -r '.mcp_broker.deployment.service_name' "$CONFIG_FILE")
    local region
    region=$(jq -r '.mcp_broker.deployment.region' "$CONFIG_FILE")
    local port
    port=$(jq -r '.mcp_broker.deployment.port' "$CONFIG_FILE")
    local memory
    memory=$(jq -r '.mcp_broker.deployment.memory' "$CONFIG_FILE")
    local cpu
    cpu=$(jq -r '.mcp_broker.deployment.cpu' "$CONFIG_FILE")
    local max_instances
    max_instances=$(jq -r '.mcp_broker.deployment.max_instances' "$CONFIG_FILE")
    local min_instances
    min_instances=$(jq -r '.mcp_broker.deployment.min_instances' "$CONFIG_FILE")
    
    # Deploy to Cloud Run
    local deploy_cmd="gcloud run deploy $service_name \
        --image $image_name \
        --platform managed \
        --region $region \
        --port $port \
        --memory $memory \
        --cpu $cpu \
        --max-instances $max_instances \
        --min-instances $min_instances \
        --allow-unauthenticated \
        --set-env-vars PROJECT_ID=$project_id \
        --set-env-vars SERVICE_NAME=$service_name"
    
    log "Executing deployment command..."
    if eval "$deploy_cmd"; then
        log "Cloud Run deployment successful"
    else
        log "ERROR: Cloud Run deployment failed"
        return 1
    fi
    
    # Get service URL
    local service_url
    service_url=$(gcloud run services describe "$service_name" --region="$region" --format="value(status.url)")
    log "Service deployed at: $service_url"
    
    echo "$service_url"
}

# Health check
health_check() {
    local service_url="$1"
    local max_attempts=10
    local attempt=1
    
    log "Performing health check..."
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        if curl -f -s "$service_url/health" >/dev/null 2>&1; then
            log "✅ Health check passed"
            return 0
        fi
        
        log "Health check failed, retrying in 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log "❌ Health check failed after $max_attempts attempts"
    return 1
}

# Compliance verification
verify_compliance() {
    local service_url="$1"
    
    log "Verifying compliance requirements..."
    
    # Test age verification
    if curl -f -s "$service_url/health" | jq -e '.age_verified == true' >/dev/null 2>&1; then
        log "✅ Age verification compliance passed"
    else
        log "❌ Age verification compliance failed"
        return 1
    fi
    
    # Test LifeWard standard
    if curl -f -s "$service_url/health" | jq -e '.lifeward_standard == true' >/dev/null 2>&1; then
        log "✅ LifeWard standard compliance passed"
    else
        log "❌ LifeWard standard compliance failed"
        return 1
    fi
    
    # Test brand protection
    if curl -f -s "$service_url/health" | jq -e '.brand_protection == true' >/dev/null 2>&1; then
        log "✅ Brand protection compliance passed"
    else
        log "❌ Brand protection compliance failed"
        return 1
    fi
    
    log "All compliance checks passed"
    return 0
}

# Main deployment function
deploy_mcp_broker() {
    log "Starting MCP Broker deployment..."
    
    # Validate configuration
    if ! validate_config "$CONFIG_FILE"; then
        log "ERROR: Configuration validation failed"
        exit 1
    fi
    
    # Setup environment
    local project_id
    project_id=$(setup_environment)
    if [[ -z "$project_id" ]]; then
        log "ERROR: Environment setup failed"
        exit 1
    fi
    
    # Build Docker image
    local image_name
    image_name=$(build_docker_image "$project_id")
    if [[ -z "$image_name" ]]; then
        log "ERROR: Docker image build failed"
        exit 1
    fi
    
    # Deploy to Cloud Run
    local service_url
    service_url=$(deploy_to_cloud_run "$project_id" "$image_name")
    if [[ -z "$service_url" ]]; then
        log "ERROR: Cloud Run deployment failed"
        exit 1
    fi
    
    # Health check
    if ! health_check "$service_url"; then
        log "ERROR: Health check failed"
        exit 1
    fi
    
    # Compliance verification
    if ! verify_compliance "$service_url"; then
        log "ERROR: Compliance verification failed"
        exit 1
    fi
    
    log "🎉 MCP Broker deployment completed successfully!"
    log "Service URL: $service_url"
    log "Health endpoint: $service_url/health"
    log "Status endpoint: $service_url/status"
    
    echo "$service_url"
}

# Main execution
main() {
    local action="${1:-deploy}"
    
    case "$action" in
        "deploy")
            deploy_mcp_broker
            ;;
        "validate")
            validate_config "$CONFIG_FILE"
            ;;
        "health")
            local service_url="${2:-}"
            if [[ -z "$service_url" ]]; then
                echo "Usage: $0 health <service_url>"
                exit 1
            fi
            health_check "$service_url"
            ;;
        *)
            echo "Usage: $0 {deploy|validate|health}"
            echo "  deploy   - Deploy MCP Broker to Cloud Run"
            echo "  validate - Validate configuration"
            echo "  health   - Check service health"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
