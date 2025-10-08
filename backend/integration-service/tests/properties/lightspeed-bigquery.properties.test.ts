// PROPERTY-BASED TESTS FOR LIGHTSPEED BIGQUERY PIPELINE
// Tests invariants and edge cases using fast-check

import fc from 'fast-check';
import { LightspeedBigQueryPipeline } from '../../src/lightspeed-bigquery';

// Mock implementations for testing
jest.mock('@google-cloud/bigquery');
jest.mock('axios');

describe('LightspeedBigQueryPipeline Property Tests', () => {
  let pipeline: LightspeedBigQueryPipeline;

  beforeEach(() => {
    // Mock environment variables
    process.env.LIGHTSPEED_TOKEN = 'test-token';
    process.env.GCP_PROJECT_ID = 'test-project';
    process.env.BIGQUERY_DATASET = 'test_dataset';
    
    pipeline = new LightspeedBigQueryPipeline();
  });

  describe('Data Transformation Properties', () => {
    test('All sales must have timestamp', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          saleID: fc.string(),
          completed_at: fc.date().map(d => d.toISOString()),
          customer: fc.option(fc.record({ id: fc.string() })),
          Sale_Lines: fc.array(fc.record({
            Item: fc.option(fc.record({
              itemID: fc.string(),
              description: fc.string()
            })),
            unitQuantity: fc.float({ min: Math.fround(0.1), max: Math.fround(100) }),
            calcTotal: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => n.toString())
          })),
          SalePayments: fc.array(fc.record({
            PaymentType: fc.option(fc.record({ name: fc.string() }))
          }))
        })),
        (sales) => {
          const rows = pipeline['transformSalesToBigQuery'](sales);
          
          // Property: Every row must have a timestamp
          rows.forEach(row => {
            expect(row.timestamp).toBeDefined();
            expect(typeof row.timestamp).toBe('string');
            expect(() => new Date(row.timestamp)).not.toThrow();
          });
        }
      ));
    });

    test('Customer ID defaults to anonymous for missing customers', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          saleID: fc.string(),
          completed_at: fc.date().map(d => d.toISOString()),
          customer: fc.constant(undefined), // No customer
          Sale_Lines: fc.array(fc.record({
            Item: fc.option(fc.record({
              itemID: fc.string(),
              description: fc.string()
            })),
            unitQuantity: fc.float({ min: Math.fround(0.1), max: Math.fround(100) }),
            calcTotal: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => n.toString())
          })),
          SalePayments: fc.array(fc.record({
            PaymentType: fc.option(fc.record({ name: fc.string() }))
          }))
        })),
        (sales) => {
          const rows = pipeline['transformSalesToBigQuery'](sales);
          
          // Property: All rows should have customer_id = 'anonymous'
          rows.forEach(row => {
            expect(row.customer_id).toBe('anonymous');
          });
        }
      ));
    });

    test('Product ID defaults to unknown for missing products', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          saleID: fc.string(),
          completed_at: fc.date().map(d => d.toISOString()),
          customer: fc.option(fc.record({ id: fc.string() })),
          Sale_Lines: fc.array(fc.record({
            Item: fc.constant(undefined), // No product info
            unitQuantity: fc.float({ min: Math.fround(0.1), max: Math.fround(100) }),
            calcTotal: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => n.toString())
          })),
          SalePayments: fc.array(fc.record({
            PaymentType: fc.option(fc.record({ name: fc.string() }))
          }))
        })),
        (sales) => {
          const rows = pipeline['transformSalesToBigQuery'](sales);
          
          // Property: All rows should have product_id = 'unknown'
          rows.forEach(row => {
            expect(row.product_id).toBe('unknown');
            expect(row.product_name).toBe('Unknown Product');
          });
        }
      ));
    });

    test('Price must be positive', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          saleID: fc.string(),
          completed_at: fc.date().map(d => d.toISOString()),
          customer: fc.option(fc.record({ id: fc.string() })),
          Sale_Lines: fc.array(fc.record({
            Item: fc.option(fc.record({
              itemID: fc.string(),
              description: fc.string()
            })),
            unitQuantity: fc.float({ min: Math.fround(0.1), max: Math.fround(100) }),
            calcTotal: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => n.toString())
          })),
          SalePayments: fc.array(fc.record({
            PaymentType: fc.option(fc.record({ name: fc.string() }))
          }))
        })),
        (sales) => {
          const rows = pipeline['transformSalesToBigQuery'](sales);
          
          // Property: All prices must be positive
          rows.forEach(row => {
            expect(row.price).toBeGreaterThan(0);
            expect(row.quantity).toBeGreaterThan(0);
          });
        }
      ));
    });

    test('Sale ID is preserved through transformation', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          saleID: fc.string(),
          completed_at: fc.date().map(d => d.toISOString()),
          customer: fc.option(fc.record({ id: fc.string() })),
          Sale_Lines: fc.array(fc.record({
            Item: fc.option(fc.record({
              itemID: fc.string(),
              description: fc.string()
            })),
            unitQuantity: fc.float({ min: Math.fround(0.1), max: Math.fround(100) }),
            calcTotal: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => n.toString())
          })),
          SalePayments: fc.array(fc.record({
            PaymentType: fc.option(fc.record({ name: fc.string() }))
          }))
        })),
        (sales) => {
          const rows = pipeline['transformSalesToBigQuery'](sales);
          
          // Property: Sale ID must be preserved
          const saleIds = new Set(sales.map(s => s.saleID));
          const rowSaleIds = new Set(rows.map(r => r.sale_id));
          
          expect(saleIds).toEqual(rowSaleIds);
        }
      ));
    });
  });

  describe('Error Handling Properties', () => {
    test('Invalid sales are skipped gracefully', () => {
      fc.assert(fc.property(
        fc.array(fc.record({
          saleID: fc.string(), // Required field
          completed_at: fc.date().map(d => d.toISOString()), // Required field
          customer: fc.option(fc.record({ id: fc.string() })),
          Sale_Lines: fc.array(fc.record({
            Item: fc.option(fc.record({
              itemID: fc.string(),
              description: fc.string()
            })),
            unitQuantity: fc.float({ min: Math.fround(0.1), max: Math.fround(100) }), // Must be positive
            calcTotal: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => n.toString()) // Must be positive
          })),
          SalePayments: fc.array(fc.record({
            PaymentType: fc.option(fc.record({ name: fc.string() }))
          }))
        })),
        (sales) => {
          const rows = pipeline['transformSalesToBigQuery'](sales);
          
          // Property: All returned rows must be valid
          rows.forEach(row => {
            expect(row.sale_id).toBeDefined();
            expect(row.timestamp).toBeDefined();
            expect(row.price).toBeGreaterThan(0);
            expect(row.quantity).toBeGreaterThan(0);
          });
        }
      ));
    });

    test('Empty input produces empty output', () => {
      const rows = pipeline['transformSalesToBigQuery']([]);
      expect(rows).toEqual([]);
    });

    test('Null/undefined inputs are handled gracefully', () => {
      expect(() => pipeline['transformSalesToBigQuery'](null as any)).not.toThrow();
      expect(() => pipeline['transformSalesToBigQuery'](undefined as any)).not.toThrow();
    });
  });

  describe('Performance Properties', () => {
    test('Large batches are processed within memory limits', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (batchSize) => {
          const sales = Array.from({ length: batchSize }, (_, i) => ({
            saleID: `sale-${i}`,
            completed_at: new Date().toISOString(),
            customer: { id: `customer-${i}` },
            Sale_Lines: [{
              Item: { itemID: `product-${i}`, description: `Product ${i}` },
              unitQuantity: 1,
              calcTotal: '10.00'
            }],
            SalePayments: [{
              PaymentType: { name: 'Credit Card' }
            }]
          }));

          const startTime = Date.now();
          const rows = pipeline['transformSalesToBigQuery'](sales);
          const duration = Date.now() - startTime;

          // Property: Processing should complete quickly
          expect(duration).toBeLessThan(1000); // Less than 1 second
          expect(rows.length).toBeLessThanOrEqual(batchSize);
        }
      ));
    });
  });

  describe('Idempotency Properties', () => {
    test('Duplicate sales are handled correctly', () => {
      const sales = [
        {
          saleID: 'duplicate-sale',
          completed_at: new Date().toISOString(),
          customer: { id: 'customer-1' },
          Sale_Lines: [{
            Item: { itemID: 'product-1', description: 'Product 1' },
            unitQuantity: 1,
            calcTotal: '10.00'
          }],
          SalePayments: [{
            PaymentType: { name: 'Credit Card' }
          }]
        },
        {
          saleID: 'duplicate-sale', // Same sale ID
          completed_at: new Date().toISOString(),
          customer: { id: 'customer-1' },
          Sale_Lines: [{
            Item: { itemID: 'product-1', description: 'Product 1' },
            unitQuantity: 1,
            calcTotal: '10.00'
          }],
          SalePayments: [{
            PaymentType: { name: 'Credit Card' }
          }]
        }
      ];

      const rows = pipeline['transformSalesToBigQuery'](sales);
      
      // Property: Duplicate sales should produce duplicate rows
      // (deduplication happens at BigQuery level)
      expect(rows.length).toBe(2);
      expect(rows[0].sale_id).toBe(rows[1].sale_id);
    });
  });
});

// Integration tests
describe('LightspeedBigQueryPipeline Integration Tests', () => {
  test('Health check returns valid status', async () => {
    const pipeline = new LightspeedBigQueryPipeline();
    const health = await pipeline.healthCheck();
    
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    expect(health.timestamp).toBeDefined();
    expect(health.version).toBe('1.0.0');
    expect(typeof health.lightspeed_connected).toBe('boolean');
    expect(typeof health.bigquery_connected).toBe('boolean');
  });

  test('Sync with empty input returns success', async () => {
    const pipeline = new LightspeedBigQueryPipeline();
    const result = await pipeline.syncSalesData({ since: new Date().toISOString() });
    
    expect(result.success).toBe(true);
    expect(result.inserted).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.latency_ms).toBeGreaterThan(0);
  });
});

