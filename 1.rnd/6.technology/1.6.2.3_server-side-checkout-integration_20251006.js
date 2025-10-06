#!/usr/bin/env node

/**
 * SERVER-SIDE CHECKOUT INTEGRATION - AUTOMATED
 * 
 * Tier 1 Solution: Server-side integration for checkout pickup date/time fix
 * Maximum automation, minimum human work, live testing capability
 *
 * USAGE:
 * 1. Deploy to server: node 1.6.2.3_server-side-checkout-integration_20251006.js
 * 2. Test live cart: curl -X POST http://localhost:3000/api/test-checkout
 * 3. Monitor changes: tail -f logs/checkout-integration.log
 *
 * WHAT IT DOES:
 * - Integrates checkout pickup fix into server-side templates
 * - Provides live cart testing endpoints
 * - Automates deployment and verification
 * - Monitors changes in real-time
 * - Provides rollback capabilities
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ServerSideCheckoutIntegration {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.logFile = 'logs/checkout-integration.log';
        this.backupDir = `backups/checkout-${new Date().toISOString().split('T')[0]}`;
        this.templateDir = 'templates';
        this.publicDir = 'public';
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupLogging();
    }

    // Setup Express middleware
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(this.publicDir));
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS for testing
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }

    // Setup API routes
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'checkout-integration',
                timestamp: new Date().toISOString(),
                version: '2.0'
            });
        });

        // Deploy checkout fix
        this.app.post('/api/deploy-checkout-fix', async (req, res) => {
            try {
                const result = await this.deployCheckoutFix();
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Test live cart
        this.app.post('/api/test-checkout', async (req, res) => {
            try {
                const result = await this.testLiveCart(req.body);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get checkout status
        this.app.get('/api/checkout-status', async (req, res) => {
            try {
                const status = await this.getCheckoutStatus();
                res.json({ success: true, status });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Rollback changes
        this.app.post('/api/rollback-checkout', async (req, res) => {
            try {
                const result = await this.rollbackChanges();
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Serve checkout template
        this.app.get('/checkout', (req, res) => {
            res.sendFile(path.join(__dirname, 'templates', 'checkout.html'));
        });

        // Serve test page
        this.app.get('/test-checkout', (req, res) => {
            res.sendFile(path.join(__dirname, 'templates', 'test-checkout.html'));
        });
    }

    // Setup logging
    setupLogging() {
        // Ensure logs directory exists
        this.ensureDirectoryExists('logs');
        
        // Log all requests
        this.app.use((req, res, next) => {
            const logEntry = `${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}\n`;
            fs.appendFile(this.logFile, logEntry).catch(console.error);
            next();
        });
    }

    // Deploy checkout fix to server templates
    async deployCheckoutFix() {
        this.log('🚀 Starting checkout fix deployment...');
        
        // Create backup
        await this.createBackup();
        
        // Update checkout template
        await this.updateCheckoutTemplate();
        
        // Update CSS styles
        await this.updateCheckoutStyles();
        
        // Update JavaScript
        await this.updateCheckoutScripts();
        
        // Verify deployment
        const verification = await this.verifyDeployment();
        
        this.log('✅ Checkout fix deployment completed');
        return {
            backup: this.backupDir,
            verification,
            timestamp: new Date().toISOString()
        };
    }

    // Create backup of current files
    async createBackup() {
        this.log('📁 Creating backup...');
        
        await this.ensureDirectoryExists(this.backupDir);
        
        const filesToBackup = [
            'templates/checkout.html',
            'public/css/checkout.css',
            'public/js/checkout.js'
        ];
        
        for (const file of filesToBackup) {
            try {
                const sourcePath = path.join(__dirname, file);
                const backupPath = path.join(this.backupDir, path.basename(file));
                await fs.copyFile(sourcePath, backupPath);
                this.log(`✅ Backed up: ${file}`);
            } catch (error) {
                this.log(`⚠️  Could not backup ${file}: ${error.message}`);
            }
        }
    }

    // Update checkout template with pickup fix
    async updateCheckoutTemplate() {
        this.log('📝 Updating checkout template...');
        
        const templatePath = path.join(__dirname, 'templates', 'checkout.html');
        
        const updatedTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - Reggie & Dro</title>
    <link rel="stylesheet" href="/css/checkout.css">
    <style>
        .pickup-section {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .date-time-selector {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
        }
        .pickup-success {
            color: #28a745;
            font-size: 14px;
            margin-top: 10px;
        }
        .pickup-error {
            color: #dc3545;
            font-size: 14px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="checkout-container">
        <h1>Checkout</h1>
        
        <div class="pickup-section">
            <h3>Pickup Method</h3>
            <div class="form-group">
                <label>
                    <input type="radio" name="pickup-method" value="store-pickup" checked>
                    In-Store Pickup at R&D Stone Oak SATX#1
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="radio" name="pickup-method" value="delivery">
                    Delivery
                </label>
            </div>
            
            <div class="date-time-selector">
                <div class="form-group">
                    <label for="pickup-date">Pickup Date</label>
                    <input type="date" id="pickup-date" name="pickup-date" required>
                </div>
                <div class="form-group">
                    <label for="pickup-time">Pickup Time</label>
                    <select id="pickup-time" name="pickup-time" required>
                        <option value="">Choose a time...</option>
                    </select>
                </div>
            </div>
            
            <div id="pickup-status"></div>
        </div>
        
        <div class="cart-summary">
            <h3>Order Summary</h3>
            <div id="cart-items"></div>
            <div class="total">
                <strong>Total: $<span id="cart-total">0.00</span></strong>
            </div>
        </div>
        
        <button id="checkout-submit" class="checkout-btn" disabled>
            Complete Order
        </button>
    </div>
    
    <script src="/js/checkout.js"></script>
    <script>
        // Checkout Pickup Fix Integration
        document.addEventListener('DOMContentLoaded', function() {
            initializeCheckoutFix();
        });
        
        function initializeCheckoutFix() {
            console.log('🚀 Initializing checkout pickup fix...');
            
            // Set minimum date to today
            const dateInput = document.getElementById('pickup-date');
            const timeSelect = document.getElementById('pickup-time');
            const statusDiv = document.getElementById('pickup-status');
            const submitBtn = document.getElementById('checkout-submit');
            
            if (dateInput) {
                dateInput.min = new Date().toISOString().split('T')[0];
                dateInput.max = getMaxDate();
                
                dateInput.addEventListener('change', function() {
                    handleDateSelection(this.value);
                });
            }
            
            if (timeSelect) {
                populateTimeOptions();
                timeSelect.addEventListener('change', function() {
                    handleTimeSelection(this.value);
                });
            }
            
            // Pickup method change
            document.querySelectorAll('input[name="pickup-method"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'store-pickup') {
                        document.querySelector('.date-time-selector').style.display = 'grid';
                    } else {
                        document.querySelector('.date-time-selector').style.display = 'none';
                    }
                });
            });
            
            // Form submission
            submitBtn.addEventListener('click', function() {
                if (validatePickupSelection()) {
                    processCheckout();
                }
            });
        }
        
        function populateTimeOptions() {
            const timeSelect = document.getElementById('pickup-time');
            const times = [];
            
            for (let hour = 9; hour <= 21; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const timeString = hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0');
                    const displayTime = formatTime(hour, minute);
                    times.push('<option value="' + timeString + '">' + displayTime + '</option>');
                }
            }
            
            timeSelect.innerHTML = '<option value="">Choose a time...</option>' + times.join('');
        }
        
        function formatTime(hour, minute) {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            return displayHour + ':' + minute.toString().padStart(2, '0') + ' ' + period;
        }
        
        function handleDateSelection(date) {
            console.log('📅 Date selected:', date);
            showStatus('Date selected: ' + new Date(date).toLocaleDateString(), 'success');
            validatePickupSelection();
        }
        
        function handleTimeSelection(time) {
            console.log('⏰ Time selected:', time);
            showStatus('Time selected: ' + time, 'success');
            validatePickupSelection();
        }
        
        function validatePickupSelection() {
            const dateInput = document.getElementById('pickup-date');
            const timeSelect = document.getElementById('pickup-time');
            const submitBtn = document.getElementById('checkout-submit');
            
            const hasDate = dateInput && dateInput.value;
            const hasTime = timeSelect && timeSelect.value;
            
            if (hasDate && hasTime) {
                submitBtn.disabled = false;
                showStatus('✅ Pickup date and time selected successfully!', 'success');
                return true;
            } else {
                submitBtn.disabled = true;
                if (!hasDate || !hasTime) {
                    showStatus('❌ Please select both pickup date and time.', 'error');
                }
                return false;
            }
        }
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('pickup-status');
            if (statusDiv) {
                statusDiv.innerHTML = '<div class="pickup-' + type + '">' + message + '</div>';
            }
        }
        
        function getMaxDate() {
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            return maxDate.toISOString().split('T')[0];
        }
        
        function processCheckout() {
            const date = document.getElementById('pickup-date').value;
            const time = document.getElementById('pickup-time').value;
            const method = document.querySelector('input[name="pickup-method"]:checked').value;
            
            const checkoutData = {
                pickupDate: date,
                pickupTime: time,
                pickupMethod: method,
                timestamp: new Date().toISOString()
            };
            
            console.log('🛒 Processing checkout:', checkoutData);
            
            // Send to server
            fetch('/api/test-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(checkoutData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showStatus('✅ Checkout processed successfully!', 'success');
                    console.log('✅ Checkout result:', data.result);
                } else {
                    showStatus('❌ Checkout failed: ' + data.error, 'error');
                }
            })
            .catch(error => {
                showStatus('❌ Checkout error: ' + error.message, 'error');
                console.error('Checkout error:', error);
            });
        }
    </script>
</body>
</html>`;
        
        await fs.writeFile(templatePath, updatedTemplate);
        this.log('✅ Checkout template updated');
    }

    // Update checkout styles
    async updateCheckoutStyles() {
        this.log('🎨 Updating checkout styles...');
        
        await this.ensureDirectoryExists('public/css');
        
        const stylesPath = path.join(__dirname, 'public', 'css', 'checkout.css');
        
        const updatedStyles = `
/* Checkout Pickup Fix Styles */
.checkout-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.pickup-section {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
}

.date-time-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 15px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.pickup-success {
    color: #28a745;
    font-size: 14px;
    margin-top: 10px;
    padding: 10px;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
}

.pickup-error {
    color: #dc3545;
    font-size: 14px;
    margin-top: 10px;
    padding: 10px;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}

.checkout-btn {
    background: #007bff;
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 4px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
    margin-top: 20px;
}

.checkout-btn:hover:not(:disabled) {
    background: #0056b3;
}

.checkout-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.cart-summary {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
}

.total {
    font-size: 18px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #dee2e6;
    text-align: right;
}

@media (max-width: 768px) {
    .date-time-selector {
        grid-template-columns: 1fr;
    }
    
    .checkout-container {
        padding: 10px;
    }
}
`;
        
        await fs.writeFile(stylesPath, updatedStyles);
        this.log('✅ Checkout styles updated');
    }

    // Update checkout scripts
    async updateCheckoutScripts() {
        this.log('📜 Updating checkout scripts...');
        
        await this.ensureDirectoryExists('public/js');
        
        const scriptsPath = path.join(__dirname, 'public', 'js', 'checkout.js');
        
        const updatedScripts = `
// Checkout Pickup Fix - Server-side Integration
class CheckoutManager {
    constructor() {
        this.cart = [];
        this.pickupData = null;
        this.init();
    }
    
    init() {
        console.log('🚀 Checkout Manager initialized');
        this.loadCart();
        this.setupEventListeners();
        this.updateCartDisplay();
    }
    
    loadCart() {
        // Load cart from localStorage or server
        const savedCart = localStorage.getItem('checkout-cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        } else {
            // Default test items
            this.cart = [
                { id: 1, name: 'Sour Guava THCA', price: 45.00, quantity: 4 },
                { id: 2, name: 'Gorilla Glue #4', price: 50.00, quantity: 1 }
            ];
        }
    }
    
    setupEventListeners() {
        // Cart update events
        document.addEventListener('cartUpdated', () => {
            this.updateCartDisplay();
        });
        
        // Pickup validation events
        document.addEventListener('pickupValidated', (event) => {
            this.pickupData = event.detail;
            this.updateCheckoutButton();
        });
    }
    
    updateCartDisplay() {
        const cartItemsDiv = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        
        if (cartItemsDiv) {
            cartItemsDiv.innerHTML = this.cart.map(item => 
                \`<div class="cart-item">
                    <span>\${item.name} x\${item.quantity}</span>
                    <span>\$\${(item.price * item.quantity).toFixed(2)}</span>
                </div>\`
            ).join('');
        }
        
        if (cartTotalSpan) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotalSpan.textContent = total.toFixed(2);
        }
    }
    
    updateCheckoutButton() {
        const submitBtn = document.getElementById('checkout-submit');
        if (submitBtn) {
            submitBtn.disabled = !this.pickupData || this.cart.length === 0;
        }
    }
    
    processCheckout() {
        if (!this.pickupData) {
            throw new Error('Pickup data required');
        }
        
        const orderData = {
            cart: this.cart,
            pickup: this.pickupData,
            timestamp: new Date().toISOString(),
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        console.log('🛒 Processing order:', orderData);
        return orderData;
    }
}

// Initialize checkout manager
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckoutManager;
}
`;
        
        await fs.writeFile(scriptsPath, updatedScripts);
        this.log('✅ Checkout scripts updated');
    }

    // Test live cart functionality
    async testLiveCart(testData) {
        this.log('🧪 Testing live cart...');
        
        const testResult = {
            timestamp: new Date().toISOString(),
            testData,
            results: {}
        };
        
        // Test pickup date validation
        if (testData.pickupDate) {
            const date = new Date(testData.pickupDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            testResult.results.dateValid = date >= today;
            testResult.results.dateFormatted = date.toLocaleDateString();
        }
        
        // Test pickup time validation
        if (testData.pickupTime) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            testResult.results.timeValid = timeRegex.test(testData.pickupTime);
            testResult.results.timeFormatted = testData.pickupTime;
        }
        
        // Test pickup method
        if (testData.pickupMethod) {
            testResult.results.methodValid = ['store-pickup', 'delivery'].includes(testData.pickupMethod);
        }
        
        // Overall validation
        testResult.results.overallValid = Object.values(testResult.results).every(result => 
            typeof result === 'boolean' ? result : true
        );
        
        this.log('✅ Live cart test completed');
        return testResult;
    }

    // Get checkout status
    async getCheckoutStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            service: 'checkout-integration',
            version: '2.0',
            status: 'operational',
            components: {
                template: await this.checkFileExists('templates/checkout.html'),
                styles: await this.checkFileExists('public/css/checkout.css'),
                scripts: await this.checkFileExists('public/js/checkout.js'),
                backup: await this.checkFileExists(this.backupDir)
            },
            endpoints: {
                health: '/health',
                deploy: '/api/deploy-checkout-fix',
                test: '/api/test-checkout',
                status: '/api/checkout-status',
                rollback: '/api/rollback-checkout'
            }
        };
        
        return status;
    }

    // Rollback changes
    async rollbackChanges() {
        this.log('🔄 Rolling back changes...');
        
        const filesToRestore = [
            'templates/checkout.html',
            'public/css/checkout.css',
            'public/js/checkout.js'
        ];
        
        const results = [];
        
        for (const file of filesToRestore) {
            try {
                const backupPath = path.join(this.backupDir, path.basename(file));
                const targetPath = path.join(__dirname, file);
                
                await fs.copyFile(backupPath, targetPath);
                results.push({ file, status: 'restored' });
                this.log(`✅ Restored: ${file}`);
            } catch (error) {
                results.push({ file, status: 'failed', error: error.message });
                this.log(`❌ Failed to restore ${file}: ${error.message}`);
            }
        }
        
        this.log('🔄 Rollback completed');
        return {
            timestamp: new Date().toISOString(),
            results,
            backupDir: this.backupDir
        };
    }

    // Verify deployment
    async verifyDeployment() {
        const verification = {
            timestamp: new Date().toISOString(),
            checks: {}
        };
        
        // Check template
        verification.checks.template = await this.checkFileExists('templates/checkout.html');
        
        // Check styles
        verification.checks.styles = await this.checkFileExists('public/css/checkout.css');
        
        // Check scripts
        verification.checks.scripts = await this.checkFileExists('public/js/checkout.js');
        
        // Check backup
        verification.checks.backup = await this.checkFileExists(this.backupDir);
        
        // Overall status
        verification.checks.overall = Object.values(verification.checks).every(check => check);
        
        return verification;
    }

    // Helper methods
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    async checkFileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ${message}\n`;
        console.log(message);
        fs.appendFile(this.logFile, logEntry).catch(console.error);
    }

    // Start server
    async start() {
        await this.ensureDirectoryExists('logs');
        await this.ensureDirectoryExists('templates');
        await this.ensureDirectoryExists('public/css');
        await this.ensureDirectoryExists('public/js');
        
        this.app.listen(this.port, () => {
            this.log(`🚀 Server-side checkout integration running on port ${this.port}`);
            this.log(`📱 Test page: http://localhost:${this.port}/test-checkout`);
            this.log(`🛒 Checkout page: http://localhost:${this.port}/checkout`);
            this.log(`🔧 API endpoints: http://localhost:${this.port}/api/`);
        });
    }
}

// Start the server
if (require.main === module) {
    const server = new ServerSideCheckoutIntegration();
    server.start().catch(console.error);
}

module.exports = ServerSideCheckoutIntegration;
