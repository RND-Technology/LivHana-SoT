### API Client Helper

**File:** `tests/helpers/api-client.ts`

```typescript
import axios from 'axios';
import { getTestToken } from '../fixtures/auth-tokens';

export class TestAPIClient {
  constructor(
    private baseURL: string,
    private token?: string
  ) {}

  async get(endpoint: string, options = {}) {
    return axios.get(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token || getTestToken()}`,
        ...options.headers,
      },
    });
  }

  async post(endpoint: string, data: any, options = {}) {
    return axios.post(`${this.baseURL}${endpoint}`, data, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token || getTestToken()}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  // ... put, delete, patch methods
}

export const integrationAPI = new TestAPIClient('http://localhost:3005');
export const reasoningAPI = new TestAPIClient('http://localhost:4002');
export const voiceAPI = new TestAPIClient('http://localhost:4001');
```
