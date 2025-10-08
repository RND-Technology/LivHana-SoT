// Dispatch Adapter - B2B courier network
// API Docs: https://info.dispatchit.com/the-dispatch-api

import axios, { type AxiosInstance } from 'axios';
import { type CarrierAdapter, type QuoteReq, type QuoteResp, type OrderReq, type OrderResp, type StatusEvt } from '../types/carrier.js';

interface DispatchConfig {
  apiKey: string;
  organizationId: string;
  baseUrl?: string;
}

export class DispatchAdapter implements CarrierAdapter {
  readonly name = 'dispatch' as const;
  private client: AxiosInstance;

  constructor(config: DispatchConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl ?? 'https://api.dispatch.com/v1',
      headers: {
        'Authorization': `Token ${config.apiKey}`,
        'X-Dispatch-Organization': config.organizationId,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async getQuote(req: QuoteReq): Promise<QuoteResp> {
    // Dispatch API: POST /quotes
    const response = await this.client.post<{
      id: string;
      price_cents: number;
      eta_minutes: number;
    }>('/quotes', {
      origin: { postal_code: req.fromZip },
      destination: { postal_code: req.toZip },
      package: { weight_grams: req.weightGrams },
    });

    return {
      carrier: this.name,
      priceCents: response.data.price_cents,
      etaMins: response.data.eta_minutes,
      quoteId: response.data.id,
    };
  }

  async createOrder(req: OrderReq): Promise<OrderResp> {
    // Dispatch API: POST /deliveries
    const response = await this.client.post<{
      id: string;
      external_id: string;
      status: string;
    }>('/deliveries', {
      quote_id: req.quoteId,
      description: req.pkg.desc,
      declared_value_cents: req.pkg.valueCents,
      callback_url: req.webhooks.status,
    });

    return {
      orderId: response.data.id,
      externalId: response.data.external_id,
      status: this.normalizeStatus(response.data.status),
    };
  }

  parseWebhook(payload: unknown): StatusEvt {
    // Dispatch webhook format: { delivery_id, status, timestamp, pod }
    const data = payload as {
      delivery_id: string;
      status: string;
      timestamp: number;
      proof_of_delivery?: { photo?: string; signature?: string };
    };

    return {
      carrier: this.name,
      externalId: data.delivery_id,
      status: this.normalizeStatus(data.status),
      at: data.timestamp,
      proof: data.proof_of_delivery ? {
        photoUrl: data.proof_of_delivery.photo,
        sig: data.proof_of_delivery.signature,
      } : undefined,
    };
  }

  private normalizeStatus(dispatchStatus: string): StatusEvt['status'] {
    const statusMap: Record<string, StatusEvt['status']> = {
      'pending': 'created',
      'accepted': 'assigned',
      'in_transit': 'picked_up',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'failed': 'failed',
    };

    return statusMap[dispatchStatus] ?? 'created';
  }
}
