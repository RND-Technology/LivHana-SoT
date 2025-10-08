// Roadie Adapter - Same-day delivery nationwide
// API Docs: https://docs.roadie.com/
// API Catalog: https://apitracker.io/a/roadie-io

import axios, { type AxiosInstance } from 'axios';
import { type CarrierAdapter, type QuoteReq, type QuoteResp, type OrderReq, type OrderResp, type StatusEvt } from '../types/carrier.js';

interface RoadieConfig {
  apiKey: string;
  baseUrl?: string;
}

export class RoadieAdapter implements CarrierAdapter {
  readonly name = 'roadie' as const;
  private client: AxiosInstance;

  constructor(config: RoadieConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl ?? 'https://api.roadie.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async getQuote(req: QuoteReq): Promise<QuoteResp> {
    // Roadie API: POST /shipments/estimate
    const response = await this.client.post<{
      id: string;
      price: { amount_cents: number };
      eta_minutes: number;
    }>('/shipments/estimate', {
      pickup: { postal_code: req.fromZip },
      delivery: { postal_code: req.toZip },
      items: [{
        weight_grams: req.weightGrams,
      }],
      requested_eta_minutes: req.etaMins,
    });

    return {
      carrier: this.name,
      priceCents: response.data.price.amount_cents,
      etaMins: response.data.eta_minutes,
      quoteId: response.data.id,
    };
  }

  async createOrder(req: OrderReq): Promise<OrderResp> {
    // Roadie API: POST /shipments
    const response = await this.client.post<{
      id: string;
      reference_id: string;
      state: string;
    }>('/shipments', {
      estimate_id: req.quoteId,
      description: req.pkg.desc,
      value: { amount_cents: req.pkg.valueCents },
      webhook_url: req.webhooks.status,
    });

    return {
      orderId: response.data.id,
      externalId: response.data.reference_id,
      status: this.normalizeStatus(response.data.state),
    };
  }

  parseWebhook(payload: unknown): StatusEvt {
    // Roadie webhook format: { shipment_id, state, timestamp, proof }
    const data = payload as {
      shipment_id: string;
      state: string;
      timestamp: string;
      proof_of_delivery?: { photo_url?: string; signature_url?: string };
    };

    return {
      carrier: this.name,
      externalId: data.shipment_id,
      status: this.normalizeStatus(data.state),
      at: new Date(data.timestamp).getTime(),
      proof: data.proof_of_delivery ? {
        photoUrl: data.proof_of_delivery.photo_url,
        sig: data.proof_of_delivery.signature_url,
      } : undefined,
    };
  }

  private normalizeStatus(roadieState: string): StatusEvt['status'] {
    const statusMap: Record<string, StatusEvt['status']> = {
      'scheduled': 'created',
      'assigned': 'assigned',
      'picked_up': 'picked_up',
      'delivered': 'delivered',
      'canceled': 'cancelled',
      'failed': 'failed',
    };

    return statusMap[roadieState] ?? 'created';
  }
}
