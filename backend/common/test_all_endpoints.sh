#!/bin/bash
echo "🔥 TESTING ALL ENDPOINTS..."
echo ""
echo "Backend Health:"
curl -s http://localhost:3005/health | jq '.status, .bigQuery.mode, .square.mode'
echo ""
echo "Square Catalog (first product):"
curl -s http://localhost:3005/api/square/catalog | jq '.products[0] | {name, price, sku}'
echo ""
echo "BigQuery Dashboard:"
curl -s http://localhost:3005/api/bigquery/dashboard | jq '.metrics | {todayRevenue, totalTransactions}'
echo ""
echo "✅ All endpoints tested!"

# Last updated: 2025-10-02
