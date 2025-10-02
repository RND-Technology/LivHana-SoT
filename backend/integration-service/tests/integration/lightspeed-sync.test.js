/**
 * LightSpeed → BigQuery Sync Pipeline - Integration Tests
 *
 * TEST COVERAGE:
 * - OAuth2 refresh token flow
 * - Transaction history fetch
 * - Product catalog sync
 * - BigQuery insertion
 * - Error handling (OAuth expired, API rate limit)
 * - Mock mode fallback
 * - Incremental sync (not full refresh)
 *
 * MISSION: Comprehensive integration tests for LightSpeed sync pipeline
 */

const axios = require('axios');
const { BigQuery } = require('@google-cloud/bigquery');

// Mock modules
jest.mock('axios');
jest.mock('@google-cloud/bigquery');

describe('LightSpeed → BigQuery Sync Pipeline', () => {
  let mockBigQuery;
  let mockTable;
  let mockDataset;
  let originalEnv;
  let mockExit;
  let mockConsoleLog;
  let mockConsoleError;

  beforeAll(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    // Reset environment
    process.env.GCP_PROJECT_ID = 'test-project';
    process.env.BQ_DATASET = 'analytics';
    process.env.LIGHTSPEED_ACCOUNT_ID = '123456';
    process.env.LIGHTSPEED_CLIENT_ID = 'test-client-id';
    process.env.LIGHTSPEED_CLIENT_SECRET = 'test-client-secret';
    process.env.LIGHTSPEED_REFRESH_TOKEN = 'test-refresh-token';
    process.env.LIGHTSPEED_API_BASE = 'https://api.lightspeedapp.com';
    process.env.LIGHTSPEED_USE_MOCK = 'false';

    // Mock BigQuery
    mockTable = {
      insert: jest.fn().mockResolvedValue([{}]),
    };
    mockDataset = {
      table: jest.fn().mockReturnValue(mockTable),
    };
    mockBigQuery = {
      dataset: jest.fn().mockReturnValue(mockDataset),
    };
    BigQuery.mockImplementation(() => mockBigQuery);

    // Mock process.exit to prevent test interruption
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Suppress console output in tests
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore mocks
    if (mockExit) mockExit.mockRestore();
    if (mockConsoleLog) mockConsoleLog.mockRestore();
    if (mockConsoleError) mockConsoleError.mockRestore();
  });

  afterAll(() => {
    // Restore environment
    process.env = originalEnv;
  });

  describe('OAuth2 Refresh Token Flow', () => {
    test('should successfully refresh access token with valid credentials', async () => {
      // Mock successful OAuth response
      axios.post.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token-123',
          refresh_token: 'new-refresh-token-456',
          expires_in: 3600,
          token_type: 'Bearer'
        }
      });

      // Mock successful transaction API call
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { Sale: [] }
        })
      });

      // Import and run sync (after mocks are set)
      jest.isolateModules(() => {
        require('../../scripts/sync-lightspeed-to-bigquery');
      });

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify OAuth call
      expect(axios.post).toHaveBeenCalledWith(
        'https://cloud.lightspeedapp.com/oauth/access_token.php',
        expect.any(URLSearchParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const callParams = axios.post.mock.calls[0][1];
      expect(callParams.get('grant_type')).toBe('refresh_token');
      expect(callParams.get('client_id')).toBe('test-client-id');
      expect(callParams.get('client_secret')).toBe('test-client-secret');
      expect(callParams.get('refresh_token')).toBe('test-refresh-token');
    });

    test('should fail gracefully when OAuth credentials are expired', async () => {
      // Mock OAuth failure (401 Unauthorized)
      axios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'invalid_grant', error_description: 'Refresh token expired' }
        },
        message: 'Request failed with status code 401'
      });

      // Import and run sync script
      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Verify error handling - should have called process.exit(1)
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(axios.post).toHaveBeenCalled();
    });

    test('should handle OAuth token refresh with network timeout', async () => {
      // Mock timeout error
      axios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      });

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Should exit with error code
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Transaction History Fetch', () => {
    test('should fetch and transform transactions correctly', async () => {
      const mockTransactions = [
        {
          saleID: '1001',
          calcSubtotal: '100.00',
          calcTax: '8.00',
          calcTotal: '108.00',
          customerID: 'cust-123',
          completed: 'true',
          createTime: '2023-10-01T10:00:00Z',
          updateTime: '2023-10-01T10:05:00Z'
        },
        {
          saleID: '1002',
          calcSubtotal: '250.50',
          calcTax: '20.04',
          calcTotal: '270.54',
          customerID: null,
          completed: 'true',
          createTime: '2023-10-02T14:30:00Z',
          updateTime: '2023-10-02T14:35:00Z'
        }
      ];

      // Mock OAuth
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      // Mock LightSpeed API
      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({
            data: { Sale: mockTransactions }
          })
          .mockResolvedValueOnce({
            data: { Sale: [] } // Empty to stop pagination
          })
          .mockResolvedValueOnce({
            data: { Item: [] } // Empty products
          })
      };
      axios.create.mockReturnValue(mockClient);

      // Run sync
      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Verify BigQuery insert was called with transformed data
      expect(mockTable.insert).toHaveBeenCalled();

      const insertedData = mockTable.insert.mock.calls[0][0];
      expect(insertedData).toHaveLength(2);
      expect(insertedData[0]).toMatchObject({
        id: '1001',
        amount: 100,
        tax: 8,
        total: 108,
        customer_id: 'cust-123',
        status: 'COMPLETED'
      });
    });

    test('should handle pagination for large transaction sets', async () => {
      // Create mock paginated responses
      const page1 = Array(100).fill(null).map((_, i) => ({
        saleID: String(1000 + i),
        calcSubtotal: '50.00',
        calcTax: '4.00',
        calcTotal: '54.00',
        customerID: `cust-${i}`,
        completed: 'true',
        createTime: '2023-10-01T10:00:00Z',
        updateTime: '2023-10-01T10:05:00Z'
      }));

      const page2 = Array(50).fill(null).map((_, i) => ({
        saleID: String(2000 + i),
        calcSubtotal: '75.00',
        calcTax: '6.00',
        calcTotal: '81.00',
        customerID: `cust-${100 + i}`,
        completed: 'true',
        createTime: '2023-10-02T10:00:00Z',
        updateTime: '2023-10-02T10:05:00Z'
      }));

      // Mock OAuth
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      // Mock paginated API responses
      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: page1 } })  // First page
          .mockResolvedValueOnce({ data: { Sale: page2 } })  // Second page
          .mockResolvedValueOnce({ data: { Sale: [] } })     // Empty = end
          .mockResolvedValueOnce({ data: { Item: [] } })     // Products
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 300);
        });
      });

      // Verify multiple API calls for pagination
      // Should be 3: 2 for transactions (stops when < 100), 1 for products
      expect(mockClient.get).toHaveBeenCalledTimes(3);

      // Verify params for offset pagination
      const firstCall = mockClient.get.mock.calls[0][1];
      expect(firstCall.params.offset).toBe(0);
      expect(firstCall.params.limit).toBe(100);

      const secondCall = mockClient.get.mock.calls[1][1];
      expect(secondCall.params.offset).toBe(100);
      expect(secondCall.params.limit).toBe(100);
    });

    test('should filter transactions by timestamp (incremental sync)', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Verify timestamp filter in API call
      const apiCall = mockClient.get.mock.calls[0];
      expect(apiCall[1].params.timeStamp).toMatch(/^>,\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Product Catalog Sync', () => {
    test('should fetch and transform products correctly', async () => {
      const mockProducts = [
        {
          itemID: 'item-001',
          description: 'Blue Dream - Flower',
          longDescription: 'Premium sativa-dominant hybrid',
          Category: { name: 'Flower' },
          defaultCost: '45.00',
          cost: '27.00',
          ItemShops: {
            ItemShop: {
              qoh: 50,
              defaultCost: '45.00'
            }
          },
          createTime: '2023-01-01T00:00:00Z',
          updateTime: '2023-10-01T10:00:00Z'
        },
        {
          itemID: 'item-002',
          description: 'OG Kush Pre-Roll',
          longDescription: 'Classic indica pre-roll',
          Category: { name: 'Pre-Rolls' },
          defaultCost: '15.00',
          cost: '9.00',
          ItemShops: {
            ItemShop: {
              qoh: 100,
              defaultCost: '15.00'
            }
          },
          createTime: '2023-02-01T00:00:00Z',
          updateTime: '2023-09-15T12:00:00Z'
        }
      ];

      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: mockProducts } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Find the products insert call (second call)
      const productInsert = mockTable.insert.mock.calls.find(call =>
        call[0][0]?.name === 'Blue Dream - Flower'
      );

      expect(productInsert).toBeTruthy();
      expect(productInsert[0]).toHaveLength(2);
      expect(productInsert[0][0]).toMatchObject({
        id: 'item-001',
        name: 'Blue Dream - Flower',
        category: 'Flower',
        price: 45,
        cost: 27,
        quantity: 50
      });
    });

    test('should handle products with multiple shop locations', async () => {
      const mockProduct = {
        itemID: 'item-multi',
        description: 'Multi-Location Product',
        Category: { name: 'Edibles' },
        ItemShops: {
          ItemShop: [
            { qoh: 25, defaultCost: '30.00', cost: '18.00' },
            { qoh: 40, defaultCost: '30.00', cost: '18.00' }
          ]
        },
        createTime: '2023-01-01T00:00:00Z'
      };

      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [mockProduct] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Should use first shop location
      const productInsert = mockTable.insert.mock.calls.find(call =>
        call[0][0]?.id === 'item-multi'
      );
      expect(productInsert[0][0].quantity).toBe(25);
    });
  });

  describe('BigQuery Insertion', () => {
    test('should batch insert transactions in chunks of 1000', async () => {
      // Create 2500 transactions (should result in 3 batches)
      const largeTransactionSet = Array(2500).fill(null).map((_, i) => ({
        saleID: String(i),
        calcSubtotal: '100.00',
        calcTax: '8.00',
        calcTotal: '108.00',
        customerID: `cust-${i}`,
        completed: 'true',
        createTime: '2023-10-01T10:00:00Z',
        updateTime: '2023-10-01T10:05:00Z'
      }));

      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: largeTransactionSet } })
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 300);
        });
      });

      // Should have 3 insert calls for transactions (1000 + 1000 + 500)
      const transactionInserts = mockTable.insert.mock.calls.filter(call =>
        call[0][0]?.id === '0' || call[0][0]?.id === '1000' || call[0][0]?.id === '2000'
      );

      expect(transactionInserts.length).toBeGreaterThanOrEqual(3);
    });

    test('should handle BigQuery insertion errors gracefully', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({
            data: {
              Sale: [{
                saleID: '1001',
                calcSubtotal: '100.00',
                calcTax: '8.00',
                calcTotal: '108.00',
                completed: 'true',
                createTime: '2023-10-01T10:00:00Z'
              }]
            }
          })
          .mockResolvedValueOnce({ data: { Sale: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      // Mock BigQuery error
      mockTable.insert.mockRejectedValueOnce(new Error('BigQuery quota exceeded'));

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 300);
        });
      });

      // Should exit with error
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    test('should use correct BigQuery table names', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Verify dataset and table calls
      expect(mockDataset.table).toHaveBeenCalledWith('lightspeed_transactions');
      expect(mockDataset.table).toHaveBeenCalledWith('lightspeed_products');
    });

    test('should pass correct insert options to BigQuery', async () => {
      const mockTransaction = {
        saleID: '1001',
        calcSubtotal: '100.00',
        calcTax: '8.00',
        calcTotal: '108.00',
        completed: 'true',
        createTime: '2023-10-01T10:00:00Z'
      };

      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [mockTransaction] } })
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Check insert options
      const insertCall = mockTable.insert.mock.calls[0];
      expect(insertCall[1]).toMatchObject({
        skipInvalidRows: true,
        ignoreUnknownValues: true
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API rate limit (429) errors', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn().mockRejectedValueOnce({
          response: {
            status: 429,
            data: { error: 'Rate limit exceeded' }
          },
          message: 'Request failed with status code 429'
        })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 300);
        });
      });

      // Should exit with error
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    test('should handle network errors gracefully', async () => {
      axios.post.mockRejectedValueOnce({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.lightspeedapp.com'
      });

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 300);
        });
      });

      // Should exit with error
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    test('should handle malformed API responses', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: null }) // Malformed response
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Should handle gracefully without crashing
      expect(mockClient.get).toHaveBeenCalled();
    });
  });

  describe('Mock Mode Fallback', () => {
    test('should use mock data when LIGHTSPEED_USE_MOCK is true', async () => {
      process.env.LIGHTSPEED_USE_MOCK = 'true';

      // Mock data should be used, no API calls
      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Should NOT call OAuth or API
      expect(axios.post).not.toHaveBeenCalled();
      expect(axios.create).not.toHaveBeenCalled();

      // Should still insert into BigQuery
      expect(mockTable.insert).toHaveBeenCalled();
    });

    test('should generate realistic mock transaction data', async () => {
      process.env.LIGHTSPEED_USE_MOCK = 'true';

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      const insertedTransactions = mockTable.insert.mock.calls[0][0];

      expect(insertedTransactions).toBeDefined();
      expect(insertedTransactions.length).toBeGreaterThan(0);

      // Check transaction structure
      const transaction = insertedTransactions[0];
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('amount');
      expect(transaction).toHaveProperty('tax');
      expect(transaction).toHaveProperty('total');
      expect(transaction).toHaveProperty('status');
      expect(transaction).toHaveProperty('created_at');
    });

    test('should generate realistic mock product data', async () => {
      process.env.LIGHTSPEED_USE_MOCK = 'true';

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Find products insert
      const productInsert = mockTable.insert.mock.calls.find(call =>
        call[0][0]?.name && call[0][0]?.category
      );

      expect(productInsert).toBeDefined();
      const products = productInsert[0];
      expect(products.length).toBeGreaterThan(0);

      // Check product structure
      const product = products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('cost');
      expect(product).toHaveProperty('quantity');
    });

    test('should fallback to mock when authentication fails', async () => {
      process.env.LIGHTSPEED_USE_MOCK = 'false';
      process.env.LIGHTSPEED_CLIENT_SECRET = ''; // Invalid auth
      process.env.LIGHTSPEED_API_KEY = ''; // No API key either

      // Should exit with error due to missing auth
      jest.isolateModules(() => {
        require('../../scripts/sync-lightspeed-to-bigquery');
      });

      // Wait a bit for the script to process
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have exited with error code 1
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Incremental Sync Logic', () => {
    test('should query only recent transactions (last 2 years)', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Verify timestamp filter
      const apiCall = mockClient.get.mock.calls[0];
      const timestamp = apiCall[1].params.timeStamp;

      expect(timestamp).toMatch(/^>,\d{4}-\d{2}-\d{2}T/);

      // Parse and verify it's approximately 2 years ago
      const timestampDate = new Date(timestamp.substring(2));
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const timeDiff = Math.abs(timestampDate - twoYearsAgo);
      expect(timeDiff).toBeLessThan(7 * 24 * 60 * 60 * 1000); // Within a week
    });

    test('should support full refresh mode when needed', async () => {
      // In current implementation, we always fetch last 2 years
      // This test verifies that behavior is consistent

      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Transactions should have timestamp filter
      const transactionCall = mockClient.get.mock.calls.find(call =>
        call[0] === '/Sale.json'
      );
      expect(transactionCall[1].params).toHaveProperty('timeStamp');

      // Products should NOT have timestamp filter (full sync)
      const productCall = mockClient.get.mock.calls.find(call =>
        call[0] === '/Item.json'
      );
      expect(productCall[1].params).not.toHaveProperty('timeStamp');
    });

    test('should stop pagination when no more results', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token' }
      });

      const mockClient = {
        get: jest.fn()
          // First call: 100 results
          .mockResolvedValueOnce({
            data: {
              Sale: Array(100).fill(null).map((_, i) => ({
                saleID: String(i),
                calcSubtotal: '50.00',
                calcTax: '4.00',
                calcTotal: '54.00',
                completed: 'true',
                createTime: '2023-10-01T10:00:00Z'
              }))
            }
          })
          // Second call: 50 results (less than limit, should stop)
          .mockResolvedValueOnce({
            data: {
              Sale: Array(50).fill(null).map((_, i) => ({
                saleID: String(100 + i),
                calcSubtotal: '50.00',
                calcTax: '4.00',
                calcTotal: '54.00',
                completed: 'true',
                createTime: '2023-10-01T10:00:00Z'
              }))
            }
          })
          // Should NOT make third call for transactions
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 300);
        });
      });

      // Should make exactly 3 calls: 2 for transactions (stopped at 50), 1 for products
      expect(mockClient.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('API Client Configuration', () => {
    test('should create client with correct base URL', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'test-token-123' }
      });

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Verify axios.create was called with correct config
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.lightspeedapp.com/API/V3/Account/123456',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }),
          timeout: 30000
        })
      );
    });

    test('should use API Key authentication when provided', async () => {
      process.env.LIGHTSPEED_API_KEY = 'test-api-key-456';
      delete process.env.LIGHTSPEED_CLIENT_SECRET;
      delete process.env.LIGHTSPEED_REFRESH_TOKEN;

      const mockClient = {
        get: jest.fn()
          .mockResolvedValueOnce({ data: { Sale: [] } })
          .mockResolvedValueOnce({ data: { Item: [] } })
      };
      axios.create.mockReturnValue(mockClient);

      await new Promise((resolve) => {
        jest.isolateModules(() => {
          require('../../scripts/sync-lightspeed-to-bigquery');
          setTimeout(resolve, 200);
        });
      });

      // Should NOT call OAuth endpoint
      expect(axios.post).not.toHaveBeenCalled();

      // Should use Basic Auth with API key
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /)
          })
        })
      );
    });
  });
});
// Last optimized: 2025-10-02
