// Cannabis-Compliant Payment Processing Service
// Using KAJA/Authorize.Net for cannabis business

const express = require('express');
const crypto = require('crypto');
const { createLogger } = require('../../common/logging');

const logger = createLogger('cannabis-payment');

// Cannabis-specific payment processing with compliance
class CannabisPaymentProcessor {
    constructor() {
        this.apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
        this.transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
        this.sandbox = process.env.AUTHORIZE_NET_SANDBOX === 'true';
        this.apiUrl = this.sandbox
            ? 'https://apitest.authorize.net/xml/v1/request.api'
            : 'https://api.authorize.net/xml/v1/request.api';
    }

    // Age verification before payment
    async verifyAge(customerId, dateOfBirth) {
        const age = this.calculateAge(dateOfBirth);
        if (age < 21) {
            throw new Error('Customer must be 21 or older for cannabis purchases');
        }
        return true;
    }

    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Process cannabis payment with compliance checks
    async processPayment(paymentData) {
        try {
            // Verify age first
            await this.verifyAge(paymentData.customerId, paymentData.dateOfBirth);
            
            // Check state compliance
            const isCompliant = await this.checkStateCompliance(paymentData.state, paymentData.items);
            if (!isCompliant) {
                throw new Error('Transaction does not meet state compliance requirements');
            }

            // Process payment through Authorize.Net
            const transactionId = await this.chargeCard(paymentData);
            
            // Log transaction for compliance reporting
            await this.logComplianceTransaction(transactionId, paymentData);
            
            return {
                success: true,
                transactionId,
                message: 'Payment processed successfully'
            };
        } catch (error) {
            logger.error('Payment failed:', error);
            throw error;
        }
    }

    // Check state-specific cannabis regulations
    async checkStateCompliance(state, items) {
        // State-specific rules would be implemented here
        const complianceRules = {
            'CA': { maxQuantity: 28.5, allowedTypes: ['flower', 'edible', 'concentrate'] },
            'CO': { maxQuantity: 28, allowedTypes: ['flower', 'edible', 'concentrate', 'topical'] },
            'WA': { maxQuantity: 28, allowedTypes: ['flower', 'edible', 'concentrate', 'topical'] },
            'OR': { maxQuantity: 56, allowedTypes: ['flower', 'edible', 'concentrate', 'topical'] }
        };

        const rules = complianceRules[state];
        if (!rules) {
            throw new Error(`Cannabis sales not permitted in state: ${state}`);
        }

        // Check quantity limits
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity > rules.maxQuantity) {
            throw new Error(`Quantity exceeds state limit of ${rules.maxQuantity} grams`);
        }

        // Check product types
        for (const item of items) {
            if (!rules.allowedTypes.includes(item.type)) {
                throw new Error(`Product type ${item.type} not allowed in ${state}`);
            }
        }

        return true;
    }

    // Charge card through Authorize.Net
    async chargeCard() {
        // This would integrate with Authorize.Net API
        // Simplified for demonstration
        const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex');
        
        // In production, this would make actual API call
        // const response = await fetch(this.apiUrl, { ... });
        
        return transactionId;
    }

    // Log transaction for compliance reporting
    async logComplianceTransaction(transactionId, paymentData) {
        const logEntry = {
            transactionId,
            timestamp: new Date().toISOString(),
            customerId: paymentData.customerId,
            state: paymentData.state,
            items: paymentData.items,
            total: paymentData.amount,
            complianceVerified: true
        };
        
        // In production, this would write to compliance database
        logger.info('Compliance transaction logged:', logEntry);
        
        return true;
    }

    // Generate compliance report
    async generateComplianceReport(startDate, endDate, state) {
        // This would query the compliance database
        const report = {
            period: { start: startDate, end: endDate },
            state: state,
            totalTransactions: 0,
            totalRevenue: 0,
            productBreakdown: {},
            ageVerifications: 0,
            complianceRate: '100%'
        };
        
        return report;
    }
}

// Express routes
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

const processor = new CannabisPaymentProcessor();

// Process payment endpoint
app.post('/api/payment/cannabis', async (req, res) => {
    try {
        const result = await processor.processPayment(req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Compliance report endpoint
app.get('/api/compliance/report', async (req, res) => {
    try {
        const { startDate, endDate, state } = req.query;
        const report = await processor.generateComplianceReport(startDate, endDate, state);
        res.json(report);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'cannabis-payment-processor',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, () => {
    logger.info(`Cannabis payment processor running on port ${port}`);
});


// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
