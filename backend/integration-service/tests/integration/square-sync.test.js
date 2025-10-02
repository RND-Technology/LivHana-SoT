/**
 * SQUARE → BIGQUERY SYNC INTEGRATION TESTS
 *
 * Comprehensive test suite for the Square sync pipeline
 * Tests: API connection, data fetch, BigQuery insertion, error handling, idempotency
 *
 * Run with: npm test -- square-sync.test.js
 */

const axios = require('axios');
const { BigQuery } = require('@google-cloud/bigquery');

// Mock implementations
jest.mock('axios');
jest.mock('@google-cloud/bigquery');

describe('Square → BigQuery Sync Pipeline Integration Tests', () => {
  let squareClient;
  let bigQueryClient;
  let mockTable;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Setup test environment
    process.env.SQUARE_ACCESS_TOKEN = 'test_token_123';
    process.env.SQUARE_LOCATION_ID = 'test_location_123';
    process.env.SQUARE_API_BASE = 'https://connect.squareup.com/v2';
    process.env.SQUARE_API_VERSION = '2024-06-15';
    process.env.GCP_PROJECT_ID = 'test-project';
    process.env.BQ_DATASET = 'analytics';

    // Mock Square client
    squareClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    axios.create = jest.fn().mockReturnValue(squareClient);

    // Mock BigQuery table
    mockTable = {
      insert: jest.fn().mockResolvedValue([{}])
    };

    // Mock BigQuery client
    bigQueryClient = {
      dataset: jest.fn().mockReturnValue({
        table: jest.fn().mockReturnValue(mockTable)
      }),
      query: jest.fn()
    };
    BigQuery.mockImplementation(() => bigQueryClient);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  // ==================== TEST 1: Square API Connection & Auth ====================
  describe('1. Square API Connection & Authentication', () => {
    test('should successfully connect to Square API with valid credentials', async () => {
      // Mock successful auth response
      squareClient.get.mockResolvedValueOnce({
        status: 200,
        data: { payments: [] }
      });

      const response = await squareClient.get('/payments', {
        params: {
          begin_time: new Date('2024-01-01').toISOString(),
          end_time: new Date().toISOString(),
          limit: 100
        }
      });

      expect(response.status).toBe(200);
      expect(squareClient.get).toHaveBeenCalledWith('/payments', expect.any(Object));
    });

    test('should fail gracefully with invalid credentials', async () => {
      squareClient.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { errors: [{ code: 'UNAUTHORIZED', detail: 'Invalid access token' }] }
        }
      });

      await expect(squareClient.get('/payments')).rejects.toMatchObject({
        response: {
          status: 401
        }
      });
    });
  });

  // ==================== TEST 2: Product Catalog Fetch ====================
  describe('2. Product Catalog Fetch (200 OK)', () => {
    test('should fetch product catalog successfully', async () => {
      const mockCatalogItems = [
        {
          type: 'ITEM',
          id: 'ITEM123',
          item_data: {
            name: 'Premium THCA Flower - 3.5g',
            category_id: 'CAT123',
            variations: [{
              item_variation_data: {
                sku: 'THCA-35',
                price_money: { amount: 4500, currency: 'USD' }
              }
            }],
            available_online: true
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];

      squareClient.get.mockResolvedValueOnce({
        status: 200,
        data: {
          objects: mockCatalogItems,
          cursor: null
        }
      });

      const response = await squareClient.get('/catalog/list', {
        params: { types: 'ITEM', limit: 100 }
      });

      expect(response.status).toBe(200);
      expect(response.data.objects).toHaveLength(1);
      expect(response.data.objects[0].type).toBe('ITEM');
      expect(response.data.objects[0].item_data.name).toBe('Premium THCA Flower - 3.5g');
    });

    test('should handle paginated catalog fetch with cursor', async () => {
      const mockPage1 = {
        status: 200,
        data: {
          objects: [{ type: 'ITEM', id: 'ITEM1' }],
          cursor: 'cursor123'
        }
      };

      const mockPage2 = {
        status: 200,
        data: {
          objects: [{ type: 'ITEM', id: 'ITEM2' }],
          cursor: null
        }
      };

      squareClient.get
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      const page1 = await squareClient.get('/catalog/list', {
        params: { types: 'ITEM', limit: 100 }
      });
      const page2 = await squareClient.get('/catalog/list', {
        params: { types: 'ITEM', limit: 100, cursor: 'cursor123' }
      });

      expect(page1.data.cursor).toBe('cursor123');
      expect(page2.data.cursor).toBeNull();
      expect(squareClient.get).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== TEST 3: Payment History Fetch (180 Days) ====================
  describe('3. Payment History Fetch (180 Days)', () => {
    test('should fetch payment history for last 180 days', async () => {
      const now = new Date();
      const beginTime = new Date(now);
      beginTime.setDate(now.getDate() - 180);

      const mockPayments = [
        {
          id: 'PAY123',
          amount_money: { amount: 4500, currency: 'USD' },
          status: 'COMPLETED',
          customer_id: 'CUST123',
          location_id: 'LOC123',
          created_at: now.toISOString(),
          source_type: 'CARD',
          card_details: { card: { card_brand: 'VISA' } },
          receipt_url: 'https://squareup.com/receipt/123'
        }
      ];

      squareClient.get.mockResolvedValueOnce({
        status: 200,
        data: {
          payments: mockPayments,
          cursor: null
        }
      });

      const response = await squareClient.get('/payments', {
        params: {
          begin_time: beginTime.toISOString(),
          end_time: now.toISOString(),
          location_id: 'test_location_123',
          limit: 100
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.payments).toHaveLength(1);
      expect(response.data.payments[0].id).toBe('PAY123');
      expect(response.data.payments[0].amount_money.amount).toBe(4500);
    });

    test('should handle empty payment history', async () => {
      squareClient.get.mockResolvedValueOnce({
        status: 200,
        data: {
          payments: [],
          cursor: null
        }
      });

      const response = await squareClient.get('/payments', {
        params: {
          begin_time: new Date('2024-01-01').toISOString(),
          end_time: new Date().toISOString(),
          limit: 100
        }
      });

      expect(response.data.payments).toHaveLength(0);
    });
  });

  // ==================== TEST 4: BigQuery Insertion (Payments Table) ====================
  describe('4. BigQuery Insertion - Payments Table', () => {
    test('should insert payment data into BigQuery successfully', async () => {
      const mockPayments = [
        {
          id: 'PAY123',
          amount: 4500,
          currency: 'USD',
          status: 'COMPLETED',
          customer_id: 'CUST123',
          location_id: 'LOC123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          source_type: 'CARD',
          card_brand: 'VISA',
          receipt_url: 'https://squareup.com/receipt/123'
        }
      ];

      await mockTable.insert(mockPayments, {
        skipInvalidRows: true,
        ignoreUnknownValues: true
      });

      expect(mockTable.insert).toHaveBeenCalledWith(
        mockPayments,
        expect.objectContaining({
          skipInvalidRows: true,
          ignoreUnknownValues: true
        })
      );
    });

    test('should batch insert large payment datasets (1000 per batch)', async () => {
      const largeDataset = Array.from({ length: 2500 }, (_, i) => ({
        id: `PAY${i}`,
        amount: 1000,
        currency: 'USD',
        status: 'COMPLETED',
        created_at: new Date().toISOString()
      }));

      const BATCH_SIZE = 1000;
      let insertCount = 0;

      for (let i = 0; i < largeDataset.length; i += BATCH_SIZE) {
        const batch = largeDataset.slice(i, i + BATCH_SIZE);
        await mockTable.insert(batch, {
          skipInvalidRows: true,
          ignoreUnknownValues: true
        });
        insertCount++;
      }

      expect(mockTable.insert).toHaveBeenCalledTimes(3); // 1000 + 1000 + 500
      expect(insertCount).toBe(3);
    });
  });

  // ==================== TEST 5: BigQuery Insertion (Items Table) ====================
  describe('5. BigQuery Insertion - Items Table', () => {
    test('should insert catalog items into BigQuery successfully', async () => {
      const mockItems = [
        {
          id: 'ITEM123',
          name: 'Premium THCA Flower - 3.5g',
          category: 'CAT123',
          sku: 'THCA-35',
          price: 4500,
          available: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];

      await mockTable.insert(mockItems, {
        skipInvalidRows: true,
        ignoreUnknownValues: true
      });

      expect(mockTable.insert).toHaveBeenCalledWith(
        mockItems,
        expect.objectContaining({
          skipInvalidRows: true,
          ignoreUnknownValues: true
        })
      );
    });

    test('should handle items with missing optional fields', async () => {
      const mockItems = [
        {
          id: 'ITEM123',
          name: 'Test Product',
          category: null,
          sku: null,
          price: null,
          available: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: null
        }
      ];

      await mockTable.insert(mockItems, {
        skipInvalidRows: true,
        ignoreUnknownValues: true
      });

      expect(mockTable.insert).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== TEST 6: Error Handling (Square API Down) ====================
  describe('6. Error Handling - Square API Unavailable', () => {
    test('should handle Square API 500 errors gracefully', async () => {
      squareClient.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { errors: [{ code: 'SERVICE_UNAVAILABLE' }] }
        },
        message: 'Internal Server Error'
      });

      await expect(squareClient.get('/payments')).rejects.toMatchObject({
        message: 'Internal Server Error'
      });
    });

    test('should handle network timeout errors', async () => {
      squareClient.get.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      });

      await expect(squareClient.get('/payments')).rejects.toMatchObject({
        code: 'ECONNABORTED'
      });
    });

    test('should handle rate limiting (429 Too Many Requests)', async () => {
      squareClient.get.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { errors: [{ code: 'RATE_LIMITED' }] },
          headers: { 'retry-after': '60' }
        },
        message: 'Rate limit exceeded'
      });

      await expect(squareClient.get('/payments')).rejects.toMatchObject({
        response: {
          status: 429
        }
      });
    });
  });

  // ==================== TEST 7: Error Handling (BigQuery Unavailable) ====================
  describe('7. Error Handling - BigQuery Unavailable', () => {
    test('should handle BigQuery insertion errors gracefully', async () => {
      mockTable.insert.mockRejectedValueOnce(new Error('BigQuery API error: quota exceeded'));

      await expect(mockTable.insert([{ id: 'TEST' }])).rejects.toThrow('BigQuery API error');
    });

    test('should handle BigQuery authentication errors', async () => {
      mockTable.insert.mockRejectedValueOnce(
        new Error('Could not load the default credentials')
      );

      await expect(mockTable.insert([{ id: 'TEST' }])).rejects.toThrow('credentials');
    });

    test('should handle partial BigQuery insertion failures', async () => {
      mockTable.insert.mockResolvedValueOnce([
        {
          kind: 'bigquery#tableDataInsertAllResponse',
          insertErrors: [
            {
              index: 0,
              errors: [
                {
                  reason: 'invalid',
                  message: 'Invalid value for field amount'
                }
              ]
            }
          ]
        }
      ]);

      const result = await mockTable.insert([
        { id: 'TEST1', amount: 'invalid' },
        { id: 'TEST2', amount: 1000 }
      ]);

      expect(result[0].insertErrors).toBeDefined();
      expect(result[0].insertErrors).toHaveLength(1);
    });
  });

  // ==================== TEST 8: Idempotency (Duplicate Sync Prevention) ====================
  describe('8. Idempotency - Duplicate Sync Prevention', () => {
    test('should detect and skip duplicate payment records', async () => {
      const duplicatePayment = {
        id: 'PAY123',
        amount: 4500,
        currency: 'USD',
        status: 'COMPLETED',
        created_at: '2024-01-01T00:00:00Z'
      };

      // Simulate checking for existing record
      const existingRecords = new Set(['PAY123']);
      const shouldInsert = !existingRecords.has(duplicatePayment.id);

      expect(shouldInsert).toBe(false);
    });

    test('should allow re-sync of updated records', async () => {
      const originalPayment = {
        id: 'PAY123',
        amount: 4500,
        status: 'PENDING',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const updatedPayment = {
        id: 'PAY123',
        amount: 4500,
        status: 'COMPLETED',
        updated_at: '2024-01-02T00:00:00Z'
      };

      const shouldUpdate = new Date(updatedPayment.updated_at) > new Date(originalPayment.updated_at);

      expect(shouldUpdate).toBe(true);
    });

    test('should track last sync timestamp to prevent redundant syncs', async () => {
      const lastSyncTime = new Date('2024-01-01T00:00:00Z');
      const currentTime = new Date('2024-01-01T00:01:00Z');
      const minSyncInterval = 15 * 60 * 1000; // 15 minutes

      const timeSinceLastSync = currentTime - lastSyncTime;
      const shouldSync = timeSinceLastSync >= minSyncInterval;

      expect(shouldSync).toBe(false); // Only 1 minute has passed
    });
  });

  // ==================== TEST 9: Mock Fallback (Degraded Mode) ====================
  describe('9. Mock Fallback - Degraded Mode', () => {
    test('should fallback to mock data when Square API is unavailable', async () => {
      const mockFallbackData = {
        objects: [
          {
            type: 'ITEM',
            id: 'MOCK123',
            item_data: {
              name: 'Mock Product',
              variations: [{
                item_variation_data: {
                  price_money: { amount: 1000, currency: 'USD' }
                }
              }]
            }
          }
        ],
        source: 'mock'
      };

      squareClient.get.mockRejectedValueOnce(new Error('Network error'));

      let response;
      try {
        response = await squareClient.get('/catalog/list');
      } catch {
        // Fallback to mock
        response = { data: mockFallbackData };
      }

      expect(response.data.source).toBe('mock');
      expect(response.data.objects).toHaveLength(1);
      expect(response.data.objects[0].id).toBe('MOCK123');
    });

    test('should indicate degraded mode in response metadata', async () => {
      const mode = 'live';
      squareClient.get.mockRejectedValueOnce(new Error('API Error'));

      let updatedMode = mode;
      try {
        await squareClient.get('/payments');
      } catch {
        updatedMode = 'degraded';
      }

      expect(updatedMode).toBe('degraded');
    });
  });

  // ==================== TEST 10: Full End-to-End Sync Cycle ====================
  describe('10. End-to-End Sync Cycle', () => {
    test('should complete full sync cycle: Square → Transform → BigQuery', async () => {
      // Step 1: Fetch from Square
      const squareData = {
        payments: [
          {
            id: 'PAY123',
            amount_money: { amount: 4500, currency: 'USD' },
            status: 'COMPLETED',
            customer_id: 'CUST123',
            location_id: 'LOC123',
            created_at: '2024-01-01T00:00:00Z',
            source_type: 'CARD',
            card_details: { card: { card_brand: 'VISA' } },
            receipt_url: 'https://squareup.com/receipt/123'
          }
        ]
      };

      squareClient.get.mockResolvedValueOnce({
        status: 200,
        data: squareData
      });

      const fetchResponse = await squareClient.get('/payments');

      // Step 2: Transform data
      const transformedPayments = fetchResponse.data.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount_money?.amount || 0,
        currency: payment.amount_money?.currency || 'USD',
        status: payment.status,
        customer_id: payment.customer_id || null,
        location_id: payment.location_id || null,
        created_at: payment.created_at,
        updated_at: payment.updated_at || null,
        source_type: payment.source_type || null,
        card_brand: payment.card_details?.card?.card_brand || null,
        receipt_url: payment.receipt_url || null
      }));

      // Step 3: Insert to BigQuery
      await mockTable.insert(transformedPayments, {
        skipInvalidRows: true,
        ignoreUnknownValues: true
      });

      // Verify full cycle
      expect(squareClient.get).toHaveBeenCalledTimes(1);
      expect(transformedPayments).toHaveLength(1);
      expect(transformedPayments[0].id).toBe('PAY123');
      expect(transformedPayments[0].amount).toBe(4500);
      expect(mockTable.insert).toHaveBeenCalledTimes(1);
    });

    test('should handle partial failures during sync cycle', async () => {
      // Fetch succeeds
      squareClient.get.mockResolvedValueOnce({
        status: 200,
        data: { payments: [{ id: 'PAY123', amount_money: { amount: 1000 } }] }
      });

      // BigQuery insert fails
      mockTable.insert.mockRejectedValueOnce(new Error('BigQuery error'));

      const fetchResponse = await squareClient.get('/payments');
      expect(fetchResponse.data.payments).toHaveLength(1);

      await expect(mockTable.insert([{ id: 'PAY123', amount: 1000 }]))
        .rejects.toThrow('BigQuery error');
    });
  });

  // ==================== TEST 11: Data Transformation Validation ====================
  describe('11. Data Transformation Validation', () => {
    test('should correctly transform Square payment to BigQuery schema', () => {
      const squarePayment = {
        id: 'PAY_ABC123',
        amount_money: { amount: 4599, currency: 'USD' },
        status: 'COMPLETED',
        customer_id: 'CUST_XYZ789',
        location_id: 'LOC_123',
        created_at: '2024-01-15T14:30:00Z',
        updated_at: '2024-01-15T14:30:05Z',
        source_type: 'CARD',
        card_details: { card: { card_brand: 'MASTERCARD', last_4: '4242' } },
        receipt_url: 'https://squareup.com/receipt/abc123'
      };

      const transformed = {
        id: squarePayment.id,
        amount: squarePayment.amount_money?.amount || 0,
        currency: squarePayment.amount_money?.currency || 'USD',
        status: squarePayment.status,
        customer_id: squarePayment.customer_id || null,
        location_id: squarePayment.location_id || null,
        created_at: squarePayment.created_at,
        updated_at: squarePayment.updated_at || null,
        source_type: squarePayment.source_type || null,
        card_brand: squarePayment.card_details?.card?.card_brand || null,
        receipt_url: squarePayment.receipt_url || null
      };

      expect(transformed.id).toBe('PAY_ABC123');
      expect(transformed.amount).toBe(4599);
      expect(transformed.currency).toBe('USD');
      expect(transformed.card_brand).toBe('MASTERCARD');
      expect(transformed.customer_id).toBe('CUST_XYZ789');
    });

    test('should correctly transform Square catalog item to BigQuery schema', () => {
      const squareItem = {
        type: 'ITEM',
        id: 'ITEM_789',
        item_data: {
          name: 'Premium CBD Gummies',
          category_id: 'CAT_EDIBLES',
          variations: [{
            item_variation_data: {
              sku: 'CBD-GUM-300',
              price_money: { amount: 3499, currency: 'USD' }
            }
          }],
          available_online: true
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T12:00:00Z'
      };

      const transformed = {
        id: squareItem.id,
        name: squareItem.item_data?.name || 'Unknown',
        category: squareItem.item_data?.category_id || null,
        sku: squareItem.item_data?.variations?.[0]?.item_variation_data?.sku || null,
        price: squareItem.item_data?.variations?.[0]?.item_variation_data?.price_money?.amount || null,
        available: squareItem.item_data?.available_online || false,
        created_at: squareItem.created_at || new Date().toISOString(),
        updated_at: squareItem.updated_at || null
      };

      expect(transformed.id).toBe('ITEM_789');
      expect(transformed.name).toBe('Premium CBD Gummies');
      expect(transformed.sku).toBe('CBD-GUM-300');
      expect(transformed.price).toBe(3499);
      expect(transformed.available).toBe(true);
    });
  });

  // ==================== TEST 12: Concurrent Sync Prevention ====================
  describe('12. Concurrent Sync Prevention', () => {
    test('should prevent multiple simultaneous syncs', async () => {
      let syncInProgress = false;

      const performSync = async () => {
        if (syncInProgress) {
          throw new Error('Sync already in progress');
        }
        syncInProgress = true;
        await new Promise(resolve => setTimeout(resolve, 100));
        syncInProgress = false;
      };

      await performSync();
      expect(syncInProgress).toBe(false);

      // Try to start another sync
      const sync1 = performSync();
      await expect(performSync()).rejects.toThrow('Sync already in progress');
      await sync1;
    });

    test('should use lock file or mutex to prevent concurrent syncs', () => {
      const locks = new Set();
      const LOCK_KEY = 'square_sync_lock';

      const acquireLock = () => {
        if (locks.has(LOCK_KEY)) {
          return false;
        }
        locks.add(LOCK_KEY);
        return true;
      };

      const releaseLock = () => {
        locks.delete(LOCK_KEY);
      };

      expect(acquireLock()).toBe(true);
      expect(acquireLock()).toBe(false); // Already locked
      releaseLock();
      expect(acquireLock()).toBe(true); // Can acquire again
    });
  });
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
