// Skipcart Adapter - San Antonio TX delivery
// API Docs: https://skipcartapi.readme.io/
// Signup: https://express.skipcart.com/auth-signup

import axios, { type AxiosInstance } from 'axios';
import { type CarrierAdapter, type QuoteReq, type QuoteResp, type OrderReq, type OrderResp, type StatusEvt } from '../types/carrier.js';

interface SkipcartConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

export class SkipcartAdapter implements CarrierAdapter {
  readonly name = 'skipcart' as const;
  private client: AxiosInstance;

  constructor(config: SkipcartConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl ?? 'https://api.skipcart.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Skipcart-Secret': config.apiSecret,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async getQuote(req: QuoteReq): Promise<QuoteResp> {
    // Skipcart API: POST /quotes
    const response = await this.client.post<{
      quote_id: string;
      price_cents: number;
      estimated_minutes: number;
    }>('/quotes', {
      pickup_address: { zip: req.fromZip },
      dropoff_address: { zip: req.toZip },
      package_weight_grams: req.weightGrams,
      requested_eta_minutes: req.etaMins,
    });

    return {
      carrier: this.name,
      priceCents: response.data.price_cents,
      etaMins: response.data.estimated_minutes,
      quoteId: response.data.quote_id,
    };
  }

  async createOrder(req: OrderReq): Promise<OrderResp> {
    // Skipcart API: POST /orders
    const response = await this.client.post<{
      order_id: string;
      external_id: string;
      status: string;
    }>('/orders', {
      quote_id: req.quoteId,
      package_description: req.pkg.desc,
      package_value_cents: req.pkg.valueCents,
      webhook_url: req.webhooks.status,
    });

    return {
      orderId: response.data.order_id,
      externalId: response.data.external_id,
      status: this.normalizeStatus(response.data.status),
    };
  }

  parseWebhook(payload: unknown): StatusEvt {
    // Skipcart webhook format: { order_id, status, timestamp, proof }
    const data = payload as {
      order_id: string;
      status: string;
      timestamp: number;
      proof?: { photo_url?: string; signature?: string };
    };

    return {
      carrier: this.name,
      externalId: data.order_id,
      status: this.normalizeStatus(data.status),
      at: data.timestamp,
      proof: data.proof ? {
        photoUrl: data.proof.photo_url,
        sig: data.proof.signature,
      } : undefined,
    };
  }

  private normalizeStatus(skipcartStatus: string): StatusEvt['status'] {
    // Map Skipcart statuses to our normalized statuses
    const statusMap: Record<string, StatusEvt['status']> = {
      'pending': 'created',
      'accepted': 'assigned',
      'picked_up': 'picked_up',
      'delivered': 'delivered',
      'failed': 'failed',
      'cancelled': 'cancelled',
    };

    return statusMap[skipcartStatus] ?? 'created';
  }
}
