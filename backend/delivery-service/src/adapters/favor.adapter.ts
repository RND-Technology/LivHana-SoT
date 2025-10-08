// Favor Adapter - Texas-only (owned by H-E-B)
// Merchant Info: https://www.favordelivery.com/for-merchants
// POS Integration: https://central.toasttab.com/s/article/Get-Started-with-the-Favor-Integration

import axios, { type AxiosInstance } from 'axios';
import { type CarrierAdapter, type QuoteReq, type QuoteResp, type OrderReq, type OrderResp, type StatusEvt } from '../types/carrier.js';

interface FavorConfig {
  merchantId: string;
  apiKey: string;
  baseUrl?: string;
}

export class FavorAdapter implements CarrierAdapter {
  readonly name = 'favor' as const;
  private client: AxiosInstance;

  constructor(config: FavorConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl ?? 'https://api.favordelivery.com/v2',
      headers: {
        'X-Favor-Merchant-ID': config.merchantId,
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async getQuote(req: QuoteReq): Promise<QuoteResp> {
    // Favor API: POST /deliveries/quote
    const response = await this.client.post<{
      quote_id: string;
      delivery_fee_cents: number;
      estimated_duration_minutes: number;
    }>('/deliveries/quote', {
      pickup_location: { zip_code: req.fromZip },
      dropoff_location: { zip_code: req.toZip },
      package: { weight_grams: req.weightGrams },
    });

    return {
      carrier: this.name,
      priceCents: response.data.delivery_fee_cents,
      etaMins: response.data.estimated_duration_minutes,
      quoteId: response.data.quote_id,
    };
  }

  async createOrder(req: OrderReq): Promise<OrderResp> {
    // Favor API: POST /deliveries
    const response = await this.client.post<{
      delivery_id: string;
      favor_id: string;
      status: string;
    }>('/deliveries', {
      quote_id: req.quoteId,
      items: [{
        description: req.pkg.desc,
        value_cents: req.pkg.valueCents,
      }],
      webhook_url: req.webhooks.status,
    });

    return {
      orderId: response.data.delivery_id,
      externalId: response.data.favor_id,
      status: this.normalizeStatus(response.data.status),
    };
  }

  parseWebhook(payload: unknown): StatusEvt {
    // Favor webhook format: { favor_id, status, timestamp, proof }
    const data = payload as {
      favor_id: string;
      status: string;
      updated_at: string;
      proof_of_delivery?: { image_url?: string; signature_data?: string };
    };

    return {
      carrier: this.name,
      externalId: data.favor_id,
      status: this.normalizeStatus(data.status),
      at: new Date(data.updated_at).getTime(),
      proof: data.proof_of_delivery ? {
        photoUrl: data.proof_of_delivery.image_url,
        sig: data.proof_of_delivery.signature_data,
      } : undefined,
    };
  }

  private normalizeStatus(favorStatus: string): StatusEvt['status'] {
    const statusMap: Record<string, StatusEvt['status']> = {
      'requested': 'created',
      'runner_assigned': 'assigned',
      'picked_up': 'picked_up',
      'completed': 'delivered',
      'canceled': 'cancelled',
      'failed': 'failed',
    };

    return statusMap[favorStatus] ?? 'created';
  }
}
