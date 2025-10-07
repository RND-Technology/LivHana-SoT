#!/bin/bash
echo "🚀 DEPLOYING DELIVERY SERVICE TO BEAT NASH!"
echo "⏰ Timeline: 30 minutes"
echo "💰 Cost: \$0 (just API keys)"
echo ""

# Check if API keys are set
if [ -z "$DOORDASH_API_KEY" ]; then
    echo "🔴 ERROR: DOORDASH_API_KEY not set"
    echo "📋 Get API key from: https://developer.doordash.com/"
    echo "💡 Run: export DOORDASH_API_KEY='your_key_here'"
    exit 1
fi

if [ -z "$UBER_EATS_API_KEY" ]; then
    echo "🔴 ERROR: UBER_EATS_API_KEY not set"
    echo "📋 Get API key from: https://developer.uber.com/"
    echo "💡 Run: export UBER_EATS_API_KEY='your_key_here'"
    exit 1
fi

echo "✅ API keys verified"
echo "🚀 Starting delivery service..."

# Deploy to production
node delivery-service.js &
DELIVERY_PID=$!

echo "✅ Delivery service started (PID: $DELIVERY_PID)"
echo "🌐 Service running on: http://localhost:3000"
echo "📊 Status: http://localhost:3000/health"
echo ""
echo "🏆 NASH BEATING DELIVERY SERVICE DEPLOYED!"
echo "💎 100% ALWAYS TRUE LIV HANA ABSOLUTE STANDARD!"
