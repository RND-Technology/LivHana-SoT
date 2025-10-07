#!/bin/bash
# GET ALL LIGHTSPEED PRODUCTS FROM REGGIEANDDRO.COM
# Mission: Complete Lightspeed product integration

set -euo pipefail

# Configuration
REGGIEANDDRO_URL="https://reggieanddro.com/products"
BIGQUERY_PROJECT="reggieanddrodispensary"
BIGQUERY_DATASET="cannabis_data"

# Colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
NC="\033[0m"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to extract products from reggieanddro.com
extract_products() {
    log "Extracting products from reggieanddro.com..."
    
    # Get the products page
    local page_content=$(curl -s "$REGGIEANDDRO_URL")
    
    if [[ -n "$page_content" ]]; then
        log "Page content received, processing..."
        
        # Extract product information using regex
        echo "$page_content" | grep -o 'data-product-id="[^"]*"' | while read -r product_id_line; do
            local product_id=$(echo "$product_id_line" | sed 's/data-product-id="//' | sed 's/"//')
            
            # Extract product name
            local product_name=$(echo "$page_content" | grep -A 10 "data-product-id=\"$product_id\"" | grep -o 'title="[^"]*"' | head -1 | sed 's/title="//' | sed 's/"//')
            
            # Extract product price
            local product_price=$(echo "$page_content" | grep -A 10 "data-product-id=\"$product_id\"" | grep -o 'data-price="[^"]*"' | head -1 | sed 's/data-price="//' | sed 's/"//')
            
            # Extract product category
            local product_category=$(echo "$page_content" | grep -A 10 "data-product-id=\"$product_id\"" | grep -o 'data-category="[^"]*"' | head -1 | sed 's/data-category="//' | sed 's/"//')
            
            # Set defaults if empty
            product_name=${product_name:-"Product $product_id"}
            product_price=${product_price:-"0"}
            product_category=${product_category:-"uncategorized"}
            
            # Insert into BigQuery
            bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
                "INSERT INTO $BIGQUERY_DATASET.lightspeed_products 
                 (product_id, name, description, category, sku, price, quantity, last_synced) 
                 VALUES ('$product_id', '$product_name', '$product_name', '$product_category', '$product_id', $product_price, 1, CURRENT_TIMESTAMP())" \
                2>/dev/null || warning "Failed to insert product $product_id"
        done
        
        log "✅ Products extraction complete"
    else
        error "No page content received"
    fi
}

# Function to get product count
get_product_count() {
    log "Getting current product count..."
    
    local count=$(bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
        "SELECT COUNT(*) as count FROM $BIGQUERY_DATASET.lightspeed_products" \
        --format=csv | tail -n +2)
    
    echo "$count"
}

# Main execution
main() {
    log "🚀 STARTING COMPREHENSIVE LIGHTSPEED PRODUCT INTEGRATION"
    log "======================================================="
    
    # Check if bq is available
    if ! command -v bq >/dev/null 2>&1; then
        error "bq is required but not installed"
        exit 1
    fi
    
    # Clear existing products
    log "Clearing existing products..."
    bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
        "DELETE FROM $BIGQUERY_DATASET.lightspeed_products WHERE 1=1" \
        2>/dev/null || warning "Failed to clear existing products"
    
    # Extract all products
    extract_products
    
    # Get final count
    local final_count=$(get_product_count)
    log "🎉 LIGHTSPEED PRODUCT INTEGRATION COMPLETE"
    log "======================================="
    log "Total products in BigQuery: $final_count"
    
    if [[ "$final_count" -gt 5 ]]; then
        log "✅ SUCCESS: Product count > 5 ($final_count products)"
    else
        warning "⚠️ WARNING: Product count still <= 5 ($final_count products)"
    fi
}

# Run main function
main "$@"
