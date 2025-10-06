#!/bin/bash

# DEPLOY CHECKOUT PICKUP FIX - AUTOMATED
# Tier 1 Solution: Deploy checkout pickup date/time fix to reggieanddro.com

echo "🚀 DEPLOYING CHECKOUT PICKUP FIX..."

# Set variables
SCRIPT_DIR="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/1.rnd/6.technology"
FIX_SCRIPT="1.6.2.3_checkout-pickup-date-fix_20251006.js"
TARGET_URL="https://reggieanddro.com"
BACKUP_DIR="/tmp/checkout-fix-backup-$(date +%Y%m%d-%H%M%S)"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "📁 Backup directory: $BACKUP_DIR"

# Function to inject script into page
inject_checkout_fix() {
    local page_url="$1"
    local script_content="$2"
    
    echo "🔧 Injecting checkout fix into: $page_url"
    
    # Create injection script
    cat > "$BACKUP_DIR/inject-fix.js" << 'EOF'
// Checkout Pickup Fix Injection Script
(function() {
    'use strict';
    
    console.log('🚀 CHECKOUT PICKUP FIX: Injecting fix...');
    
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFix);
    } else {
        injectFix();
    }
    
    function injectFix() {
        // Check if we're on checkout page
        if (!isCheckoutPage()) {
            console.log('❌ Not on checkout page, skipping injection');
            return;
        }
        
        // Inject the fix script
        const script = document.createElement('script');
        script.textContent = `EOF
    
    # Append the actual fix script content
    cat "$SCRIPT_DIR/$FIX_SCRIPT" >> "$BACKUP_DIR/inject-fix.js"
    
    # Complete the injection script
    cat >> "$BACKUP_DIR/inject-fix.js" << 'EOF'
`;
        
        document.head.appendChild(script);
        console.log('✅ CHECKOUT PICKUP FIX: Injection complete');
    }
    
    function isCheckoutPage() {
        const url = window.location.href.toLowerCase();
        const checkoutIndicators = [
            'checkout', 'cart', 'pickup', 'order', 'payment'
        ];
        
        return checkoutIndicators.some(indicator => url.includes(indicator));
    }
})();
EOF
    
    echo "✅ Injection script created"
}

# Function to test the fix
test_checkout_fix() {
    echo "🧪 Testing checkout fix..."
    
    # Create test HTML
    cat > "$BACKUP_DIR/test-checkout.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout Pickup Fix Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
    </style>
</head>
<body>
    <h1>Checkout Pickup Fix Test</h1>
    
    <div class="test-section">
        <h3>Pickup Method Selection</h3>
        <label>
            <input type="radio" name="pickup" value="store-pickup"> In-Store Pickup
        </label>
        <label>
            <input type="radio" name="pickup" value="delivery"> Delivery
        </label>
    </div>
    
    <div class="test-section">
        <h3>Date Selection</h3>
        <input type="date" id="pickup-date" placeholder="Choose pickup date">
    </div>
    
    <div class="test-section">
        <h3>Time Selection</h3>
        <select id="pickup-time">
            <option value="">Choose a time...</option>
        </select>
    </div>
    
    <div class="test-section">
        <button onclick="testSubmission()">Test Form Submission</button>
    </div>
    
    <div id="test-results"></div>
    
    <script>
        function testSubmission() {
            const date = document.getElementById('pickup-date').value;
            const time = document.getElementById('pickup-time').value;
            const pickup = document.querySelector('input[name="pickup"]:checked');
            
            const results = document.getElementById('test-results');
            
            if (date && time && pickup) {
                results.innerHTML = '<div class="test-section success">✅ Test passed: All fields filled</div>';
            } else {
                results.innerHTML = '<div class="test-section error">❌ Test failed: Missing required fields</div>';
            }
        }
    </script>
    
    <!-- Inject the fix -->
    <script>
EOF
    
    # Append the fix script
    cat "$SCRIPT_DIR/$FIX_SCRIPT" >> "$BACKUP_DIR/test-checkout.html"
    
    # Complete the test HTML
    cat >> "$BACKUP_DIR/test-checkout.html" << 'EOF'
    </script>
</body>
</html>
EOF
    
    echo "✅ Test page created: $BACKUP_DIR/test-checkout.html"
    echo "🌐 Open this file in a browser to test the fix"
}

# Function to create deployment instructions
create_deployment_instructions() {
    cat > "$BACKUP_DIR/DEPLOYMENT_INSTRUCTIONS.md" << EOF
# Checkout Pickup Fix Deployment Instructions

## Files Created
- \`inject-fix.js\` - Script to inject the fix into checkout pages
- \`test-checkout.html\` - Test page to verify the fix works
- \`1.6.2.3_checkout-pickup-date-fix_20251006.js\` - Main fix script

## Deployment Steps

### Option 1: Manual Injection
1. Open the checkout page on reggieanddro.com
2. Open browser developer tools (F12)
3. Go to Console tab
4. Paste the contents of \`inject-fix.js\`
5. Press Enter to execute

### Option 2: Browser Extension
1. Create a browser extension that injects the fix script
2. Load the extension in Chrome/Firefox
3. Navigate to checkout pages

### Option 3: Server-Side Integration
1. Add the fix script to the checkout page template
2. Include it in the page head or before closing body tag
3. Deploy the updated template

## Testing
1. Open \`test-checkout.html\` in a browser
2. Test date selection functionality
3. Test time dropdown functionality
4. Test form validation

## Verification
- [ ] Calendar dates are selectable
- [ ] Time dropdown has proper options
- [ ] Form validation works correctly
- [ ] Visual feedback is displayed
- [ ] Error messages show when required fields are missing

## Rollback
If issues occur, remove the injected script and restore original functionality.

## Support
Contact the development team if deployment issues arise.
EOF
    
    echo "✅ Deployment instructions created"
}

# Main execution
main() {
    echo "🚀 Starting checkout pickup fix deployment..."
    
    # Check if fix script exists
    if [ ! -f "$SCRIPT_DIR/$FIX_SCRIPT" ]; then
        echo "❌ Error: Fix script not found at $SCRIPT_DIR/$FIX_SCRIPT"
        exit 1
    fi
    
    # Create injection script
    inject_checkout_fix "$TARGET_URL" "$(cat "$SCRIPT_DIR/$FIX_SCRIPT")"
    
    # Create test page
    test_checkout_fix
    
    # Create deployment instructions
    create_deployment_instructions
    
    echo ""
    echo "✅ DEPLOYMENT PREPARATION COMPLETE!"
    echo "📁 Files created in: $BACKUP_DIR"
    echo ""
    echo "Next steps:"
    echo "1. Test the fix using: $BACKUP_DIR/test-checkout.html"
    echo "2. Deploy using instructions in: $BACKUP_DIR/DEPLOYMENT_INSTRUCTIONS.md"
    echo "3. Verify functionality on reggieanddro.com checkout"
    echo ""
    echo "🚀 Ready for deployment!"
}

# Run main function
main "$@"
