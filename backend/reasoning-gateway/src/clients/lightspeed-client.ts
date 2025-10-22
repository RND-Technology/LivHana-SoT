/**
 * Lightspeed Client
 * Handles Lightspeed API interactions
 */

import axios, { AxiosInstance } from 'axios';

export class LightspeedClient {
  private client: AxiosInstance;

  constructor() {
    const token = process.env.LIGHTSPEED_TOKEN;
    if (!token) {
      throw new Error('LIGHTSPEED_TOKEN environment variable required');
    }

    this.client = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async createOrder(customerId: string, productId: string, quantity: number): Promise<{ saleID: string; total: number }> {
    const response = await this.client.post('/Account/1/Sale.json', {
      customerID: customerId,
      completed: false,
      SaleLines: [
        {
          itemID: productId,
          unitQuantity: quantity,
        },
      ],
    });

    return {
      saleID: response.data.Sale.saleID,
      total: parseFloat(response.data.Sale.calcTotal || '0'),
    };
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.client.get('/Account/1.json', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

