#!/bin/bash
# GET ALL LIGHTSPEED DATA VIA LS API
# Mission: Complete Lightspeed data integration

set -euo pipefail

# Configuration
LIGHTSPEED_BASE_URL="https://api.lightspeedhq.com/API/Account/$LIGHTSPEED_ACCOUNT_ID"
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

# Function to make Lightspeed API call
lightspeed_api_call() {
    local endpoint="$1"
    local url="${LIGHTSPEED_BASE_URL}/${endpoint}.json"
    
    log "Fetching $endpoint from Lightspeed API..."
    
    local response=$(curl -s -H "Authorization: Bearer $LIGHTSPEED_CLIENT_ID" "$url")
    
    if [[ $? -eq 0 ]]; then
        echo "$response"
    else
        error "Failed to fetch $endpoint"
        return 1
    fi
}

# Function to get all items (products)
get_all_items() {
    log "Getting ALL Lightspeed items (products)..."
    
    local items_response=$(lightspeed_api_call "Item")
    
    if [[ -n "$items_response" ]]; then
        log "Items response received, processing..."
        
        # Extract item count
        local item_count=$(echo "$items_response" | jq -r '.Item | length' 2>/dev/null || echo "0")
        log "Found $item_count items"
        
        # Process each item
        echo "$items_response" | jq -r '.Item[] | @json' | while read -r item; do
            local item_id=$(echo "$item" | jq -r '.itemID // empty')
            local description=$(echo "$item" | jq -r '.Description // empty')
            local category=$(echo "$item" | jq -r '.Category.name // empty')
            local sku=$(echo "$item" | jq -r '.systemSku // empty')
            local price=$(echo "$item" | jq -r '.Prices.ItemPrice[0].amount // 0')
            local quantity=$(echo "$item" | jq -r '.ItemShops[0].qtyInStock // 0')
            local last_synced=$(date '+%Y-%m-%d %H:%M:%S')
            
            # Insert into BigQuery
            bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
                "INSERT INTO $BIGQUERY_DATASET.lightspeed_products 
                 (product_id, name, description, category, sku, price, quantity, last_synced) 
                 VALUES ('$item_id', '$description', '$description', '$category', '$sku', $price, $quantity, '$last_synced')" \
                2>/dev/null || warning "Failed to insert item $item_id"
        done
        
        log "✅ Items processing complete"
    else
        error "No items response received"
    fi
}

# Function to get all customers
get_all_customers() {
    log "Getting ALL Lightspeed customers..."
    
    local customers_response=$(lightspeed_api_call "Customer")
    
    if [[ -n "$customers_response" ]]; then
        log "Customers response received, processing..."
        
        # Extract customer count
        local customer_count=$(echo "$customers_response" | jq -r '.Customer | length' 2>/dev/null || echo "0")
        log "Found $customer_count customers"
        
        # Process each customer
        echo "$customers_response" | jq -r '.Customer[] | @json' | while read -r customer; do
            local customer_id=$(echo "$customer" | jq -r '.customerID // empty')
            local first_name=$(echo "$customer" | jq -r '.firstName // empty')
            local last_name=$(echo "$customer" | jq -r '.lastName // empty')
            local email=$(echo "$customer" | jq -r '.Email // empty')
            local phone=$(echo "$customer" | jq -r '.Phone // empty')
            local last_synced=$(date '+%Y-%m-%d %H:%M:%S')
            
            # Insert into BigQuery
            bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
                "INSERT INTO $BIGQUERY_DATASET.lightspeed_customers 
                 (customer_id, first_name, last_name, email, phone, last_synced) 
                 VALUES ('$customer_id', '$first_name', '$last_name', '$email', '$phone', '$last_synced')" \
                2>/dev/null || warning "Failed to insert customer $customer_id"
        done
        
        log "✅ Customers processing complete"
    else
        error "No customers response received"
    fi
}

# Function to get all transactions
get_all_transactions() {
    log "Getting ALL Lightspeed transactions..."
    
    local transactions_response=$(lightspeed_api_call "Sale")
    
    if [[ -n "$transactions_response" ]]; then
        log "Transactions response received, processing..."
        
        # Extract transaction count
        local transaction_count=$(echo "$transactions_response" | jq -r '.Sale | length' 2>/dev/null || echo "0")
        log "Found $transaction_count transactions"
        
        # Process each transaction
        echo "$transactions_response" | jq -r '.Sale[] | @json' | while read -r transaction; do
            local sale_id=$(echo "$transaction" | jq -r '.saleID // empty')
            local customer_id=$(echo "$transaction" | jq -r '.customerID // empty')
            local total=$(echo "$transaction" | jq -r '.calcTotal // 0')
            local date=$(echo "$transaction" | jq -r '.createTime // empty')
            local last_synced=$(date '+%Y-%m-%d %H:%M:%S')
            
            # Insert into BigQuery
            bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
                "INSERT INTO $BIGQUERY_DATASET.lightspeed_transactions 
                 (transaction_id, customer_id, total, transaction_date, last_synced) 
                 VALUES ('$sale_id', '$customer_id', $total, '$date', '$last_synced')" \
                2>/dev/null || warning "Failed to insert transaction $sale_id"
        done
        
        log "✅ Transactions processing complete"
    else
        error "No transactions response received"
    fi
}

# Main execution
main() {
    log "🚀 STARTING COMPREHENSIVE LIGHTSPEED DATA INTEGRATION"
    log "====================================================="
    
    # Check if jq is available
    if ! command -v jq >/dev/null 2>&1; then
        error "jq is required but not installed"
        exit 1
    fi
    
    # Check if bq is available
    if ! command -v bq >/dev/null 2>&1; then
        error "bq is required but not installed"
        exit 1
    fi
    
    # Create tables if they don't exist
    log "Creating BigQuery tables..."
    
    # Create lightspeed_customers table
    bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
        "CREATE TABLE IF NOT EXISTS $BIGQUERY_DATASET.lightspeed_customers (
            customer_id STRING,
            first_name STRING,
            last_name STRING,
            email STRING,
            phone STRING,
            last_synced TIMESTAMP
        )" 2>/dev/null || warning "Failed to create lightspeed_customers table"
    
    # Create lightspeed_transactions table
    bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
        "CREATE TABLE IF NOT EXISTS $BIGQUERY_DATASET.lightspeed_transactions (
            transaction_id STRING,
            customer_id STRING,
            total FLOAT,
            transaction_date STRING,
            last_synced TIMESTAMP
        )" 2>/dev/null || warning "Failed to create lightspeed_transactions table"
    
    # Get all data
    get_all_items
    get_all_customers
    get_all_transactions
    
    log "🎉 LIGHTSPEED DATA INTEGRATION COMPLETE"
    log "====================================="
    
    # Show summary
    log "Data summary:"
    bq query --use_legacy_sql=false --project_id="$BIGQUERY_PROJECT" \
        "SELECT 'Products' as type, COUNT(*) as count FROM $BIGQUERY_DATASET.lightspeed_products
         UNION ALL
         SELECT 'Customers' as type, COUNT(*) as count FROM $BIGQUERY_DATASET.lightspeed_customers
         UNION ALL
         SELECT 'Transactions' as type, COUNT(*) as count FROM $BIGQUERY_DATASET.lightspeed_transactions"
}

# Run main function
main "$@"
