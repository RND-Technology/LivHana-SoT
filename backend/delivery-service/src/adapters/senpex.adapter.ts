// Senpex Adapter - API-first last-mile network
// Developer Portal: https://dev.senpex.com/

import axios, { type AxiosInstance } from 'axios';
import { type CarrierAdapter, type QuoteReq, type QuoteResp, type OrderReq, type OrderResp, type StatusEvt } from '../types/carrier.js';

interface SenpexConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

export class SenpexAdapter implements CarrierAdapter {
  readonly name = 'senpex' as const;
  private client: AxiosInstance;

  constructor(config: SenpexConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl ?? 'https://api.senpex.com/v3',
      headers: {
        'X-API-Key': config.apiKey,
        'X-API-Secret': config.apiSecret,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async getQuote(req: QuoteReq): Promise<QuoteResp> {
    // Senpex API: POST /quotes
    const response = await this.client.post<{
      quote_id: string;
      pricing: { total_cents: number };
      estimated_time_minutes: number;
    }>('/quotes', {
      pickup: { zip: req.fromZip },
      dropoff: { zip: req.toZip },
      package: { weight_grams: req.weightGrams },
      service_level: req.etaMins < 60 ? 'express' : 'standard',
    });

    return {
      carrier: this.name,
      priceCents: response.data.pricing.total_cents,
      etaMins: response.data.estimated_time_minutes,
      quoteId: response.data.quote_id,
    };
  }

  async createOrder(req: OrderReq): Promise<OrderResp> {
    // Senpex API: POST /orders
    const response = await this.client.post<{
      order_id: string;
      tracking_number: string;
      status: string;
    }>('/orders', {
      quote_id: req.quoteId,
      package: {
        description: req.pkg.desc,
        declared_value_cents: req.pkg.valueCents,
      },
      webhook_url: req.webhooks.status,
    });

    return {
      orderId: response.data.order_id,
      externalId: response.data.tracking_number,
      status: this.normalizeStatus(response.data.status),
    };
  }

  parseWebhook(payload: unknown): StatusEvt {
    // Senpex webhook format: { tracking_number, status, timestamp, proof }
    const data = payload as {
      tracking_number: string;
      status: string;
      event_time: string;
      proof?: { photo_url?: string; signature_image?: string };
    };

    return {
      carrier: this.name,
      externalId: data.tracking_number,
      status: this.normalizeStatus(data.status),
      at: new Date(data.event_time).getTime(),
      proof: data.proof ? {
        photoUrl: data.proof.photo_url,
        sig: data.proof.signature_image,
      } : undefined,
    };
  }

  private normalizeStatus(senpexStatus: string): StatusEvt['status'] {
    const statusMap: Record<string, StatusEvt['status']> = {
      'created': 'created',
      'driver_assigned': 'assigned',
      'picked_up': 'picked_up',
      'delivered': 'delivered',
      'canceled': 'cancelled',
      'exception': 'failed',
    };

    return statusMap[senpexStatus] ?? 'created';
  }
}
