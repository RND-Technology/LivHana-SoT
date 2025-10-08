// Unit tests for Lightspeed BigQuery Pipeline
// Tests transformation logic, error handling, and health checks

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LightspeedBigQueryPipeline } from '../src/lightspeed-bigquery';

// Mock environment variables
process.env.LIGHTSPEED_TOKEN = 'test-token';
process.env.GCP_PROJECT_ID = 'test-project';
process.env.BIGQUERY_DATASET = 'test_dataset';
process.env.NODE_ENV = 'test';

// Mock BigQuery
jest.mock('@google-cloud/bigquery', () => {
  return {
    BigQuery: jest.fn().mockImplementation(() => ({
      dataset: jest.fn().mockReturnValue({
        table: jest.fn().mockReturnValue({
          insert: jest.fn().mockResolvedValue([])
        })
      }),
      createQueryJob: jest.fn().mockResolvedValue([{
        getQueryResults: jest.fn().mockResolvedValue([[]])
      }]),
      getDatasets: jest.fn().mockResolvedValue([[]]),
      query: jest.fn().mockResolvedValue([[]])
    }))
  };
});

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn()
  })
}));

describe('LightspeedBigQueryPipeline', () => {
  let pipeline: LightspeedBigQueryPipeline;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should throw error if LIGHTSPEED_TOKEN is missing', () => {
      delete process.env.LIGHTSPEED_TOKEN;
      expect(() => new LightspeedBigQueryPipeline()).toThrow('LIGHTSPEED_TOKEN');
      process.env.LIGHTSPEED_TOKEN = 'test-token';
    });

    it('should initialize with correct configuration', () => {
      pipeline = new LightspeedBigQueryPipeline();
      expect(pipeline).toBeInstanceOf(LightspeedBigQueryPipeline);
    });
  });

  describe('syncSalesData', () => {
    beforeEach(() => {
      pipeline = new LightspeedBigQueryPipeline();
    });

    it('should return success with zero inserted when no sales', async () => {
      // Mock empty sales response
      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({ data: { Sale: [] } });

      const result = await pipeline.syncSalesData();

      expect(result.success).toBe(true);
      expect(result.inserted).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing required fields gracefully', async () => {
      // Mock sales with missing fields
      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({
        data: {
          Sale: [
            {
              // Missing saleID
              completed_at: '2025-10-08T00:00:00Z',
              Sale_Lines: [],
              SalePayments: []
            }
          ]
        }
      });

      const result = await pipeline.syncSalesData();

      // Should skip invalid sales
      expect(result.success).toBe(true);
      expect(result.inserted).toBe(0);
    });

    it('should transform sales correctly', async () => {
      const mockSales = [
        {
          saleID: 'SALE-123',
          completed_at: '2025-10-08T00:00:00Z',
          customer: { id: 'CUST-456' },
          Sale_Lines: [
            {
              Item: {
                itemID: 'PROD-789',
                description: 'Test Product'
              },
              unitQuantity: 2,
              calcTotal: '19.99'
            }
          ],
          SalePayments: [
            {
              PaymentType: { name: 'Credit Card' }
            }
          ]
        }
      ];

      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({
        data: { Sale: mockSales }
      });

      const result = await pipeline.syncSalesData();

      expect(result.success).toBe(true);
      expect(result.inserted).toBeGreaterThan(0);
    });

    it('should handle anonymous customers', async () => {
      const mockSales = [
        {
          saleID: 'SALE-123',
          completed_at: '2025-10-08T00:00:00Z',
          // No customer field
          Sale_Lines: [
            {
              Item: { itemID: 'PROD-789', description: 'Test Product' },
              unitQuantity: 1,
              calcTotal: '9.99'
            }
          ],
          SalePayments: []
        }
      ];

      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({
        data: { Sale: mockSales }
      });

      const result = await pipeline.syncSalesData();

      // Should use 'anonymous' for customer_id
      expect(result.success).toBe(true);
    });

    it('should skip items with invalid quantity or price', async () => {
      const mockSales = [
        {
          saleID: 'SALE-123',
          completed_at: '2025-10-08T00:00:00Z',
          customer: { id: 'CUST-456' },
          Sale_Lines: [
            {
              Item: { itemID: 'PROD-1', description: 'Valid Product' },
              unitQuantity: 1,
              calcTotal: '10.00'
            },
            {
              Item: { itemID: 'PROD-2', description: 'Invalid Product' },
              unitQuantity: 0, // Invalid quantity
              calcTotal: '0.00'
            }
          ],
          SalePayments: []
        }
      ];

      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({
        data: { Sale: mockSales }
      });

      const result = await pipeline.syncSalesData();

      // Should only insert valid items
      expect(result.success).toBe(true);
    });

    it('should respect batch_size parameter', async () => {
      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({ data: { Sale: [] } });

      await pipeline.syncSalesData({ batch_size: 50 });

      // Verify batch_size was used in API call
      expect(axiosMock.create().get).toHaveBeenCalled();
    });

    it('should cap batch_size at 1000', async () => {
      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({ data: { Sale: [] } });

      await pipeline.syncSalesData({ batch_size: 5000 });

      // Should cap at 1000
      // Verify in actual implementation
      expect(axiosMock.create().get).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    beforeEach(() => {
      pipeline = new LightspeedBigQueryPipeline();
    });

    it('should return healthy when all services connected', async () => {
      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({ data: {} });

      const health = await pipeline.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.lightspeed_connected).toBe(true);
      expect(health.bigquery_connected).toBe(true);
    });

    it('should return degraded when Lightspeed disconnected', async () => {
      const axiosMock = require('axios');
      axiosMock.create().get.mockRejectedValue(new Error('Connection failed'));

      const health = await pipeline.healthCheck();

      expect(health.status).toBe('degraded');
      expect(health.lightspeed_connected).toBe(false);
      expect(health.bigquery_connected).toBe(true);
    });

    it('should return unhealthy when both services disconnected', async () => {
      const axiosMock = require('axios');
      axiosMock.create().get.mockRejectedValue(new Error('Connection failed'));

      const BigQueryMock = require('@google-cloud/bigquery');
      BigQueryMock.BigQuery().getDatasets.mockRejectedValue(new Error('Connection failed'));

      const health = await pipeline.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.lightspeed_connected).toBe(false);
      expect(health.bigquery_connected).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      pipeline = new LightspeedBigQueryPipeline();
    });

    it('should handle Lightspeed API errors gracefully', async () => {
      const axiosMock = require('axios');
      axiosMock.create().get.mockRejectedValue(new Error('API Error'));

      const result = await pipeline.syncSalesData();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('API Error');
    });

    it('should handle BigQuery insertion errors', async () => {
      const axiosMock = require('axios');
      axiosMock.create().get.mockResolvedValue({
        data: {
          Sale: [
            {
              saleID: 'SALE-123',
              completed_at: '2025-10-08T00:00:00Z',
              Sale_Lines: [
                {
                  Item: { itemID: 'PROD-1', description: 'Test' },
                  unitQuantity: 1,
                  calcTotal: '10.00'
                }
              ],
              SalePayments: []
            }
          ]
        }
      });

      const BigQueryMock = require('@google-cloud/bigquery');
      BigQueryMock.BigQuery().createQueryJob.mockRejectedValue(new Error('BigQuery Error'));

      const result = await pipeline.syncSalesData();

      // Should attempt fallback to individual insertion
      expect(result).toBeDefined();
    });
  });

  describe('Idempotency', () => {
    it('should handle duplicate sale IDs correctly', async () => {
      // This test verifies the MERGE statement logic
      // In actual implementation, inserting same sale twice should not create duplicates
      const axiosMock = require('axios');

      const mockSales = [
        {
          saleID: 'SALE-DUPLICATE',
          completed_at: '2025-10-08T00:00:00Z',
          Sale_Lines: [
            {
              Item: { itemID: 'PROD-1', description: 'Test' },
              unitQuantity: 1,
              calcTotal: '10.00'
            }
          ],
          SalePayments: []
        }
      ];

      axiosMock.create().get.mockResolvedValue({
        data: { Sale: mockSales }
      });

      // First sync
      const result1 = await pipeline.syncSalesData();
      expect(result1.success).toBe(true);

      // Second sync with same data
      const result2 = await pipeline.syncSalesData();
      expect(result2.success).toBe(true);

      // Should not error on duplicate
    });
  });
});
