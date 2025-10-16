### Step 5.1: Create API Client Tests

**File:** `src/api/livhanaApiClient.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from './livhanaApiClient';

vi.mock('axios');

describe('Unified API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BigQuery endpoints', () => {
    it('should fetch dashboard data', async () => {
      const mockData = { metrics: { todayRevenue: 1000 } };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await api.bigquery.dashboard();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/bigquery/dashboard')
      );
      expect(result).toEqual(mockData);
    });

    it('should fetch historical data', async () => {
      const mockData = { daily: [] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await api.bigquery.historical();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/bigquery/historical')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('Health endpoints', () => {
    it('should fetch all health statuses', async () => {
      axios.get.mockResolvedValue({ data: { status: 'healthy' } });

      const result = await api.health.all();

      expect(result).toHaveProperty('integration');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('voice');
    });

    it('should handle health check failures gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Service unavailable'));

      const result = await api.health.all();

      expect(result.integration.status).toBe('unhealthy');
    });
  });

  describe('Error handling', () => {
    it('should handle 401 errors', async () => {
      const mockError = {
        response: { status: 401, data: { error: 'Unauthorized' } }
      };
      axios.get.mockRejectedValue(mockError);

      await expect(api.bigquery.dashboard()).rejects.toThrow('Unauthorized');
    });
  });
});
```
