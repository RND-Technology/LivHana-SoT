#!/usr/bin/env node
/* eslint-env node */
/* eslint no-console: ["error", { allow: ["info", "warn", "error", "log"] }] */
// Leafly Menu/Deals/Inventory → BigQuery Sync Script
// Production-ready stub - awaiting API credentials

const { LeaflyAPIClient } = require('../backend/integration-service/src/leafly-api-client');
const { BigQuery } = require('@google-cloud/bigquery');
const { createLogger } = require('../backend/common/logging');

const logger = createLogger('leafly-menu-sync');

// BigQuery configuration
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'livhana-production';
const DATASET_ID = process.env.BIGQUERY_DATASET || 'cannabis_data';
const MENU_TABLE = 'leafly_menu';
const DEALS_TABLE = 'leafly_deals';
const PRODUCTS_TABLE = 'leafly_products';

class LeaflyMenuSyncService {
  constructor() {
    this.leaflyClient = new LeaflyAPIClient();
    this.bigquery = new BigQuery({ projectId: PROJECT_ID });
    this.dataset = this.bigquery.dataset(DATASET_ID);
  }

  /**
   * Sync menu items to BigQuery
   */
  async syncMenu() {
    try {
      logger.info('Starting Leafly menu sync');

      // Fetch menu from Leafly API
      const menuData = await this.leaflyClient.getMenu();

      if (!menuData?.items || menuData.items.length === 0) {
        logger.warn('No menu items returned from Leafly API');
        return { synced: 0 };
      }

      // Transform menu data for BigQuery
      const rows = menuData.items.map(item => ({
        sync_timestamp: new Date().toISOString(),
        dispensary_id: this.leaflyClient.dispensaryId,
        product_id: item.id,
        product_name: item.name,
        category: item.category,
        strain_type: item.strainType, // indica, sativa, hybrid
        thc_percentage: item.thc,
        cbd_percentage: item.cbd,
        price: item.price,
        sale_price: item.salePrice,
        quantity_available: item.quantity,
        in_stock: item.inStock,
        image_url: item.imageUrl,
        description: item.description,
        lab_tested: item.labTested || false,
        raw_data: JSON.stringify(item)
      }));

      // Insert into BigQuery
      await this.dataset.table(MENU_TABLE).insert(rows);

      logger.info('Leafly menu sync completed', {
        itemCount: rows.length,
        table: `${DATASET_ID}.${MENU_TABLE}`
      });

      return { synced: rows.length };
    } catch (error) {
      logger.error('Leafly menu sync failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Sync deals/promotions to BigQuery
   */
  async syncDeals() {
    try {
      logger.info('Starting Leafly deals sync');

      // Fetch deals from Leafly API
      const dealsData = await this.leaflyClient.getDeals();

      if (!dealsData?.deals || dealsData.deals.length === 0) {
        logger.info('No active deals from Leafly API');
        return { synced: 0 };
      }

      // Transform deals data for BigQuery
      const rows = dealsData.deals.map(deal => ({
        sync_timestamp: new Date().toISOString(),
        dispensary_id: this.leaflyClient.dispensaryId,
        deal_id: deal.id,
        deal_name: deal.name,
        deal_type: deal.type, // percentage, dollar_off, bogo, etc.
        discount_amount: deal.discountAmount,
        discount_percentage: deal.discountPercentage,
        start_date: deal.startDate,
        end_date: deal.endDate,
        active: deal.active,
        terms: deal.terms,
        applicable_products: JSON.stringify(deal.applicableProducts || []),
        raw_data: JSON.stringify(deal)
      }));

      // Insert into BigQuery
      await this.dataset.table(DEALS_TABLE).insert(rows);

      logger.info('Leafly deals sync completed', {
        dealCount: rows.length,
        table: `${DATASET_ID}.${DEALS_TABLE}`
      });

      return { synced: rows.length };
    } catch (error) {
      logger.error('Leafly deals sync failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Sync products catalog to BigQuery
   */
  async syncProducts() {
    try {
      logger.info('Starting Leafly products sync');

      // Fetch products from Leafly API
      const productsData = await this.leaflyClient.getProducts();

      if (!productsData?.products || productsData.products.length === 0) {
        logger.warn('No products returned from Leafly API');
        return { synced: 0 };
      }

      // Transform products data for BigQuery
      const rows = productsData.products.map(product => ({
        sync_timestamp: new Date().toISOString(),
        dispensary_id: this.leaflyClient.dispensaryId,
        product_id: product.id,
        product_name: product.name,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,
        strain_type: product.strainType,
        thc_min: product.thcMin,
        thc_max: product.thcMax,
        cbd_min: product.cbdMin,
        cbd_max: product.cbdMax,
        terpenes: JSON.stringify(product.terpenes || []),
        effects: JSON.stringify(product.effects || []),
        flavors: JSON.stringify(product.flavors || []),
        raw_data: JSON.stringify(product)
      }));

      // Insert into BigQuery
      await this.dataset.table(PRODUCTS_TABLE).insert(rows);

      logger.info('Leafly products sync completed', {
        productCount: rows.length,
        table: `${DATASET_ID}.${PRODUCTS_TABLE}`
      });

      return { synced: rows.length };
    } catch (error) {
      logger.error('Leafly products sync failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Run full sync (menu + deals + products)
   */
  async runFullSync() {
    const startTime = Date.now();
    logger.info('Starting full Leafly sync');

    try {
      // Health check first
      const isHealthy = await this.leaflyClient.healthCheck();
      if (!isHealthy) {
        throw new Error('Leafly API health check failed - check credentials');
      }

      // Sync all data in parallel for speed
      const [menuResult, dealsResult, productsResult] = await Promise.all([
        this.syncMenu(),
        this.syncDeals(),
        this.syncProducts()
      ]);

      const duration = Date.now() - startTime;

      logger.info('Full Leafly sync completed', {
        menuItems: menuResult.synced,
        deals: dealsResult.synced,
        products: productsResult.synced,
        totalRecords: menuResult.synced + dealsResult.synced + productsResult.synced,
        durationMs: duration,
        durationSec: (duration / 1000).toFixed(2)
      });

      return {
        success: true,
        menu: menuResult,
        deals: dealsResult,
        products: productsResult,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Full Leafly sync failed', {
        error: error.message,
        durationMs: duration
      });
      throw error;
    }
  }
}

// Run sync if executed directly
if (require.main === module) {
  (async () => {
    try {
      // Check environment variables
      if (!process.env.LEAFLY_API_KEY) {
        console.error('ERROR: LEAFLY_API_KEY not set');
        console.error('Set environment variable: export LEAFLY_API_KEY=your_api_key');
        process.exit(1);
      }

      if (!process.env.LEAFLY_DISPENSARY_ID) {
        console.error('ERROR: LEAFLY_DISPENSARY_ID not set');
        console.error('Set environment variable: export LEAFLY_DISPENSARY_ID=your_dispensary_id');
        process.exit(1);
      }

      const syncService = new LeaflyMenuSyncService();
      const result = await syncService.runFullSync();

      console.log('✅ Leafly sync successful');
      console.log(`   Menu items: ${result.menu.synced}`);
      console.log(`   Deals: ${result.deals.synced}`);
      console.log(`   Products: ${result.products.synced}`);
      console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);

      process.exit(0);
    } catch (error) {
      console.error('❌ Leafly sync failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { LeaflyMenuSyncService };

// Optimized: 2025-10-03
// Status: Production-ready stub - awaiting LEAFLY_API_KEY + LEAFLY_DISPENSARY_ID
// Cannabis compliance: All data logged for regulatory reporting
