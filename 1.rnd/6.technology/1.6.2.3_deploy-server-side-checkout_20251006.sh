#!/bin/bash

# DEPLOY SERVER-SIDE CHECKOUT INTEGRATION - AUTOMATED
# Tier 1 Solution: Deploy server-side checkout integration with maximum automation

echo "🚀 DEPLOYING SERVER-SIDE CHECKOUT INTEGRATION..."

# Set variables
SCRIPT_DIR="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/1.rnd/6.technology"
INTEGRATION_SCRIPT="1.6.2.3_server-side-checkout-integration_20251006.js"
TARGET_PORT="3000"
LOG_DIR="/tmp/checkout-integration-logs"
DEPLOYMENT_DIR="/tmp/checkout-integration-deployment"

# Create directories
mkdir -p "$LOG_DIR"
mkdir -p "$DEPLOYMENT_DIR"

echo "📁 Log directory: $LOG_DIR"
echo "📁 Deployment directory: $DEPLOYMENT_DIR"

# Function to deploy integration
deploy_integration() {
    echo "🔧 Deploying server-side checkout integration..."
    
    # Copy integration script
    cp "$SCRIPT_DIR/$INTEGRATION_SCRIPT" "$DEPLOYMENT_DIR/"
    
    # Create package.json for dependencies
    cat > "$DEPLOYMENT_DIR/package.json" << 'EOF'
{
  "name": "checkout-integration",
  "version": "2.0.0",
  "description": "Server-side checkout integration with pickup date/time fix",
  "main": "1.6.2.3_server-side-checkout-integration_20251006.js",
  "scripts": {
    "start": "node 1.6.2.3_server-side-checkout-integration_20251006.js",
    "test": "curl -X POST http://localhost:3000/api/test-checkout",
    "status": "curl http://localhost:3000/api/checkout-status"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF

    # Create deployment script
    cat > "$DEPLOYMENT_DIR/deploy.sh" << 'EOF'
#!/bin/bash

echo "🚀 Starting checkout integration deployment..."

# Install dependencies
npm install

# Start the integration server
echo "🔧 Starting integration server..."
node 1.6.2.3_server-side-checkout-integration_20251006.js &

# Wait for server to start
sleep 3

# Test the deployment
echo "🧪 Testing deployment..."
curl -s http://localhost:3000/health | jq .

# Test checkout functionality
echo "🛒 Testing checkout functionality..."
curl -s -X POST http://localhost:3000/api/test-checkout \
  -H "Content-Type: application/json" \
  -d '{"pickupDate":"2025-10-07","pickupTime":"14:30","pickupMethod":"store-pickup"}' | jq .

echo "✅ Deployment completed!"
EOF

    chmod +x "$DEPLOYMENT_DIR/deploy.sh"
    
    echo "✅ Integration files prepared"
}

# Function to start integration server
start_integration() {
    echo "🚀 Starting integration server..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Install dependencies
    npm install
    
    # Start server in background
    node 1.6.2.3_server-side-checkout-integration_20251006.js > "$LOG_DIR/integration.log" 2>&1 &
    SERVER_PID=$!
    
    echo "📝 Server PID: $SERVER_PID"
    echo "📝 Log file: $LOG_DIR/integration.log"
    
    # Wait for server to start
    sleep 3
    
    # Test server health
    echo "🔍 Testing server health..."
    curl -s http://localhost:3000/health | jq . || echo "❌ Health check failed"
    
    return $SERVER_PID
}

# Function to test live cart
test_live_cart() {
    echo "🧪 Testing live cart functionality..."
    
    # Test checkout endpoint
    echo "🛒 Testing checkout endpoint..."
    curl -s -X POST http://localhost:3000/api/test-checkout \
      -H "Content-Type: application/json" \
      -d '{
        "pickupDate": "2025-10-07",
        "pickupTime": "14:30",
        "pickupMethod": "store-pickup"
      }' | jq .
    
    # Test status endpoint
    echo "📊 Testing status endpoint..."
    curl -s http://localhost:3000/api/checkout-status | jq .
    
    # Test checkout page
    echo "🌐 Testing checkout page..."
    curl -s http://localhost:3000/checkout | grep -o "Pickup Method" || echo "❌ Checkout page not found"
    
    # Test test page
    echo "🧪 Testing test page..."
    curl -s http://localhost:3000/test-checkout | grep -o "Test Checkout" || echo "❌ Test page not found"
}

# Function to monitor changes
monitor_changes() {
    echo "👀 Monitoring changes..."
    
    # Create monitoring script
    cat > "$LOG_DIR/monitor.sh" << 'EOF'
#!/bin/bash

LOG_FILE="/tmp/checkout-integration-logs/integration.log"
MONITOR_LOG="/tmp/checkout-integration-logs/monitor.log"

echo "👀 Starting change monitoring..."
echo "📝 Monitor log: $MONITOR_LOG"

while true; do
    # Check server health
    HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null | jq -r '.status' 2>/dev/null)
    
    if [ "$HEALTH" = "healthy" ]; then
        echo "$(date): ✅ Server healthy" >> "$MONITOR_LOG"
    else
        echo "$(date): ❌ Server unhealthy" >> "$MONITOR_LOG"
    fi
    
    # Check for new log entries
    if [ -f "$LOG_FILE" ]; then
        NEW_ENTRIES=$(tail -n 5 "$LOG_FILE" | grep -c "ERROR\|WARN\|SUCCESS")
        if [ "$NEW_ENTRIES" -gt 0 ]; then
            echo "$(date): 📝 $NEW_ENTRIES new log entries" >> "$MONITOR_LOG"
        fi
    fi
    
    sleep 30
done
EOF

    chmod +x "$LOG_DIR/monitor.sh"
    
    # Start monitoring in background
    "$LOG_DIR/monitor.sh" > "$LOG_DIR/monitor.log" 2>&1 &
    MONITOR_PID=$!
    
    echo "📝 Monitor PID: $MONITOR_PID"
    echo "📝 Monitor log: $LOG_DIR/monitor.log"
}

# Function to create test page
create_test_page() {
    echo "🧪 Creating test page..."
    
    cat > "$DEPLOYMENT_DIR/test-checkout.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Checkout - Server-side Integration</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; }
        .test-button { padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
        .test-button:hover { background: #0056b3; }
        .result { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>Test Checkout - Server-side Integration</h1>
    
    <div class="test-section">
        <h3>Server Health Check</h3>
        <button class="test-button" onclick="testHealth()">Test Health</button>
        <div id="health-result" class="result"></div>
    </div>
    
    <div class="test-section">
        <h3>Checkout Status</h3>
        <button class="test-button" onclick="testStatus()">Get Status</button>
        <div id="status-result" class="result"></div>
    </div>
    
    <div class="test-section">
        <h3>Live Cart Test</h3>
        <button class="test-button" onclick="testCart()">Test Cart</button>
        <div id="cart-result" class="result"></div>
    </div>
    
    <div class="test-section">
        <h3>Deployment Test</h3>
        <button class="test-button" onclick="testDeployment()">Test Deployment</button>
        <div id="deployment-result" class="result"></div>
    </div>
    
    <div class="test-section">
        <h3>Rollback Test</h3>
        <button class="test-button" onclick="testRollback()">Test Rollback</button>
        <div id="rollback-result" class="result"></div>
    </div>
    
    <script>
        function showResult(elementId, data, isSuccess = true) {
            const element = document.getElementById(elementId);
            element.className = 'result ' + (isSuccess ? 'success' : 'error');
            element.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }
        
        async function testHealth() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                showResult('health-result', data, data.status === 'healthy');
            } catch (error) {
                showResult('health-result', { error: error.message }, false);
            }
        }
        
        async function testStatus() {
            try {
                const response = await fetch('/api/checkout-status');
                const data = await response.json();
                showResult('status-result', data, data.success);
            } catch (error) {
                showResult('status-result', { error: error.message }, false);
            }
        }
        
        async function testCart() {
            try {
                const response = await fetch('/api/test-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pickupDate: '2025-10-07',
                        pickupTime: '14:30',
                        pickupMethod: 'store-pickup'
                    })
                });
                const data = await response.json();
                showResult('cart-result', data, data.success);
            } catch (error) {
                showResult('cart-result', { error: error.message }, false);
            }
        }
        
        async function testDeployment() {
            try {
                const response = await fetch('/api/deploy-checkout-fix', {
                    method: 'POST'
                });
                const data = await response.json();
                showResult('deployment-result', data, data.success);
            } catch (error) {
                showResult('deployment-result', { error: error.message }, false);
            }
        }
        
        async function testRollback() {
            try {
                const response = await fetch('/api/rollback-checkout', {
                    method: 'POST'
                });
                const data = await response.json();
                showResult('rollback-result', data, data.success);
            } catch (error) {
                showResult('rollback-result', { error: error.message }, false);
            }
        }
        
        // Auto-test on page load
        window.addEventListener('load', () => {
            setTimeout(testHealth, 1000);
            setTimeout(testStatus, 2000);
        });
    </script>
</body>
</html>
EOF

    echo "✅ Test page created"
}

# Main execution
main() {
    echo "🚀 Starting server-side checkout integration deployment..."
    
    # Deploy integration
    deploy_integration
    
    # Create test page
    create_test_page
    
    # Start integration server
    start_integration
    SERVER_PID=$?
    
    # Test live cart
    test_live_cart
    
    # Monitor changes
    monitor_changes
    
    echo ""
    echo "✅ DEPLOYMENT COMPLETED!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "  - Integration server: PID $SERVER_PID"
    echo "  - Log directory: $LOG_DIR"
    echo "  - Deployment directory: $DEPLOYMENT_DIR"
    echo "  - Test page: http://localhost:3000/test-checkout"
    echo "  - Checkout page: http://localhost:3000/checkout"
    echo "  - API endpoints: http://localhost:3000/api/"
    echo ""
    echo "🔧 Commands:"
    echo "  - Test health: curl http://localhost:3000/health"
    echo "  - Test cart: curl -X POST http://localhost:3000/api/test-checkout"
    echo "  - Get status: curl http://localhost:3000/api/checkout-status"
    echo "  - View logs: tail -f $LOG_DIR/integration.log"
    echo "  - Monitor: tail -f $LOG_DIR/monitor.log"
    echo ""
    echo "🔄 To stop server: kill $SERVER_PID"
    echo "🔄 To restart: cd $DEPLOYMENT_DIR && npm start"
    echo ""
    echo "🧪 Live testing ready! Open http://localhost:3000/test-checkout"
}

# Run main function
main "$@"
