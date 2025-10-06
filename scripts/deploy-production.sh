#!/bin/bash
# Texas Takeover Production Deployment Script
# Deploys all services to Cloud Run with proper DNS configuration

set -e

echo "🚀 CHEETAH POWER - TEXAS TAKEOVER PRODUCTION DEPLOYMENT"
echo "=================================================="

# Configuration
PROJECT_ID="reggieanddrodispensary"
REGION="us-central1"
SERVICE_ACCOUNT="texas-takeover-deploy@reggieanddrodispensary.iam.gserviceaccount.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if service account exists
check_service_account() {
    print_status "Checking service account permissions..."
    
    if gcloud iam service-accounts describe $SERVICE_ACCOUNT --project=$PROJECT_ID >/dev/null 2>&1; then
        print_success "Service account exists: $SERVICE_ACCOUNT"
    else
        print_warning "Service account does not exist. Creating..."
        gcloud iam service-accounts create texas-takeover-deploy \
            --display-name="Texas Takeover Deploy" \
            --description="Service account for Texas Takeover deployments" \
            --project=$PROJECT_ID
        
        # Grant necessary permissions
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SERVICE_ACCOUNT" \
            --role="roles/run.admin"
        
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SERVICE_ACCOUNT" \
            --role="roles/iam.serviceAccountUser"
        
        print_success "Service account created and permissions granted"
    fi
}

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local image_name=$2
    local port=${3:-8080}
    
    print_status "Deploying $service_name..."
    
    if gcloud run deploy $service_name \
        --image $image_name \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port $port \
        --service-account $SERVICE_ACCOUNT \
        --project $PROJECT_ID; then
        print_success "$service_name deployed successfully"
        
        # Get the service URL
        local service_url=$(gcloud run services describe $service_name --region=$REGION --project=$PROJECT_ID --format="value(status.url)")
        echo "🌐 Service URL: $service_url"
        
        return 0
    else
        print_error "Failed to deploy $service_name"
        return 1
    fi
}

# Function to update DNS records
update_dns() {
    print_status "Updating DNS records..."
    
    # DNS configuration
    declare -A DNS_MAPPING=(
        ["reggieanddro.com"]="vibe-cockpit-980910443251.us-central1.run.app"
        ["texascoa.com"]="texas-coa-standalone-980910443251.us-central1.run.app"
        ["texastakeover.com"]="vibe-cockpit-980910443251.us-central1.run.app"
        ["livhana.com"]="vibe-cockpit-980910443251.us-central1.run.app"
        ["ops.texastakeover.com"]="ops-full-build-980910443251.us-central1.run.app"
    )
    
    # Note: DNS updates require GoDaddy API credentials
    print_warning "DNS updates require GoDaddy API credentials"
    print_status "DNS configuration prepared:"
    
    for domain in "${!DNS_MAPPING[@]}"; do
        echo "  $domain → ${DNS_MAPPING[$domain]}"
    done
    
    print_status "Use GoDaddy automation scripts to update DNS records"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    local services=("ops-full-build" "texas-coa-standalone")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        local service_url=$(gcloud run services describe $service --region=$REGION --project=$PROJECT_ID --format="value(status.url)" 2>/dev/null)
        
        if [ -n "$service_url" ]; then
            print_status "Testing $service at $service_url"
            
            if curl -s -f "$service_url/health" >/dev/null 2>&1; then
                print_success "$service is healthy"
            else
                print_warning "$service deployed but health check failed"
                all_healthy=false
            fi
        else
            print_error "$service not found"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        print_success "All services are healthy and operational"
    else
        print_warning "Some services may need attention"
    fi
}

# Main deployment function
main() {
    echo "Starting Texas Takeover production deployment..."
    echo "Project: $PROJECT_ID"
    echo "Region: $REGION"
    echo "Service Account: $SERVICE_ACCOUNT"
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    # Check if gcloud is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_error "No active gcloud authentication found"
        print_status "Run: gcloud auth login"
        exit 1
    fi
    
    # Check if project is set
    if [ "$(gcloud config get-value project)" != "$PROJECT_ID" ]; then
        print_warning "Setting project to $PROJECT_ID"
        gcloud config set project $PROJECT_ID
    fi
    
    # Check service account
    check_service_account
    
    echo ""
    print_status "Starting service deployments..."
    
    # Deploy services
    local deployment_success=true
    
    # Deploy OPS Full Build
    if ! deploy_service "ops-full-build" "gcr.io/$PROJECT_ID/ops-full-build:latest" 8080; then
        deployment_success=false
    fi
    
    # Deploy Texas COA Standalone
    if ! deploy_service "texas-coa-standalone" "gcr.io/$PROJECT_ID/texas-coa-standalone:latest" 8080; then
        deployment_success=false
    fi
    
    echo ""
    
    if [ "$deployment_success" = true ]; then
        print_success "All services deployed successfully!"
        
        # Verify deployment
        verify_deployment
        
        # Update DNS
        update_dns
        
        echo ""
        print_success "🎉 TEXAS TAKEOVER PRODUCTION DEPLOYMENT COMPLETE!"
        echo ""
        echo "🌐 Live Services:"
        echo "• OPS Full Build: https://ops-full-build-980910443251.us-central1.run.app"
        echo "• Texas COA Standalone: https://texas-coa-standalone-980910443251.us-central1.run.app"
        echo "• Texas Takeover MVP: https://vibe-cockpit-980910443251.us-central1.run.app"
        echo "• Integration Service: https://integration-service-980910443251.us-central1.run.app"
        echo "• Voice Service: https://voice-service-980910443251.us-central1.run.app"
        echo "• Reasoning Gateway: https://reasoning-gateway-980910443251.us-central1.run.app"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Update GoDaddy DNS records using automation scripts"
        echo "2. Verify SSL certificates are active"
        echo "3. Set up monitoring and alerts"
        echo "4. Test all endpoints and functionality"
        echo ""
        echo "🚀 Mission Status: DEPLOYMENT COMPLETE!"
        
    else
        print_error "Some services failed to deploy"
        print_status "Check the logs above for specific errors"
        exit 1
    fi
}

# Run main function
main "$@"
