// carrier.ts - SPEC LOCK: Multi-carrier delivery abstraction
// Unfuckwithable Code Protocol: Interface-first, deterministic, adapter-isolated

export type Carrier = 'skipcart' | 'roadie' | 'favor' | 'dispatch' | 'senpex';
export type Status = 'created'|'assigned'|'picked_up'|'delivered'|'failed'|'cancelled';

export interface QuoteReq {
  fromZip: string;
  toZip: string;
  weightGrams: number;
  etaMins: number;
}

export interface QuoteResp {
  carrier: Carrier;
  priceCents: number;
  etaMins: number;
  quoteId: string;
}

export interface OrderReq {
  carrier: Carrier;
  quoteId: string;
  pkg: {
    desc: string;
    valueCents: number;
  };
  webhooks: {
    status: string;
  };
}

export interface OrderResp {
  orderId: string;
  externalId: string;
  status: Status;
}

export interface StatusEvt {
  carrier: Carrier;
  externalId: string;
  status: Status;
  at: number;
  proof?: {
    photoUrl?: string;
    sig?: string;
  };
}

// Adapter contract - each provider implements this
export interface CarrierAdapter {
  readonly name: Carrier;
  getQuote(req: QuoteReq): Promise<QuoteResp>;
  createOrder(req: OrderReq): Promise<OrderResp>;
  parseWebhook(payload: unknown): StatusEvt;
}

// Invariants (enforced via property tests)
export const invariants = {
  // Quote price must be positive
  validQuotePrice: (resp: QuoteResp) => resp.priceCents > 0,

  // ETA must be reasonable (5 mins to 24 hours)
  validETA: (resp: QuoteResp) => resp.etaMins >= 5 && resp.etaMins <= 1440,

  // Order must have external tracking ID
  validOrder: (resp: OrderResp) => resp.externalId.length > 0,

  // Status events must have timestamp
  validStatus: (evt: StatusEvt) => evt.at > 0,

  // Zip codes must be 5 digits
  validZip: (zip: string) => /^\d{5}$/.test(zip),

  // Weight must be positive
  validWeight: (grams: number) => grams > 0 && grams < 50000, // Max 50kg
};
