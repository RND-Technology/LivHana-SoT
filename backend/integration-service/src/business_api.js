// Business Integration Service
const express = require('express');
const axios = require('axios');
const { TrinityComm } = require('../trinity_comm_interface');

class BusinessIntegration {
    constructor() {
        this.trinity = new TrinityComm();
        this.integrations = require('./business_integrations.json');
    }

    // ReggieAndDro.com E-commerce Integration
    async syncEcommerceData() {
        console.log('🛍️ Syncing ReggieAndDro.com e-commerce data...');
        
        const ecommerce = this.integrations.business_integrations.reggieanddro_com;
        
        try {
            // Sync products
            const products = await this.fetchBusinessData(ecommerce, 'products');
            await this.trinity.updateEntropicData('products', products);
            
            // Sync orders
            const orders = await this.fetchBusinessData(ecommerce, 'orders');
            await this.trinity.updateEntropicData('orders', orders);
            
            console.log('✅ E-commerce data synchronized');
        } catch (error) {
            console.error('❌ E-commerce sync failed:', error);
        }
    }

    // HighNoonCartoon.com Marketing Integration  
    async syncMarketingData() {
        console.log('📢 Syncing HighNoonCartoon.com marketing data...');
        
        const marketing = this.integrations.business_integrations.highnoonCartoon_com;
        
        try {
            // Generate content with Scriptwright
            const contentRequests = await this.fetchBusinessData(marketing, 'content');
            for (const request of contentRequests) {
                await this.generateMarketingContent(request);
            }
            
            console.log('✅ Marketing data synchronized');  
        } catch (error) {
            console.error('❌ Marketing sync failed:', error);
        }
    }

    // OnePlantSolution.com Operations Integration
    async syncOperationsData() {
        console.log('🏭 Syncing OnePlantSolution.com operations data...');
        
        const operations = this.integrations.business_integrations.oneplantsolution_com;
        
        try {
            // Monitor operations
            const opData = await this.fetchBusinessData(operations, 'operations');
            await this.trinity.updateEntropicData('operations', opData);
            
            // Compliance monitoring
            const compliance = await this.fetchBusinessData(operations, 'compliance');
            await this.trinity.updatePotentialData('compliance', compliance);
            
            console.log('✅ Operations data synchronized');
        } catch (error) {
            console.error('❌ Operations sync failed:', error);
        }
    }

    async fetchBusinessData(integration, endpoint) {
        const url = `${integration.url}${integration.integration_endpoints[endpoint]}`;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.BUSINESS_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        return response.data;
    }

    async generateMarketingContent(request) {
        // Scriptwright AI content generation
        console.log(`🤖 Generating content for: ${request.type}`);
        
        const content = await axios.post('https://livhana-scriptwright-xxx.a.run.app/generate', {
            prompt: request.prompt,
            type: request.type,
            compliance: request.compliance_requirements
        });
        
        return content.data;
    }
}

module.exports = BusinessIntegration;
