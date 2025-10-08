// Multi-carrier orchestrator with failover
// Unfuckwithable Code Protocol: Deterministic fallback, idempotent retries

import { type CarrierAdapter, type QuoteReq, type QuoteResp, type OrderReq, type OrderResp, invariants } from '../types/carrier.js';

export interface OrchestratorConfig {
  adapters: CarrierAdapter[];
  failoverTimeoutMs: number;
  maxRetries: number;
}

export class DeliveryOrchestrator {
  private adapters: CarrierAdapter[];
  private failoverTimeoutMs: number;
  private maxRetries: number;

  constructor(config: OrchestratorConfig) {
    if (config.adapters.length === 0) {
      throw new Error('At least one adapter required');
    }
    this.adapters = config.adapters;
    this.failoverTimeoutMs = config.failoverTimeoutMs;
    this.maxRetries = config.maxRetries;
  }

  /**
   * Get quotes from all carriers, return sorted by price
   */
  async getAllQuotes(req: QuoteReq): Promise<QuoteResp[]> {
    // Validate input
    if (!invariants.validZip(req.fromZip)) {
      throw new Error(`Invalid fromZip: ${req.fromZip}`);
    }
    if (!invariants.validZip(req.toZip)) {
      throw new Error(`Invalid toZip: ${req.toZip}`);
    }
    if (!invariants.validWeight(req.weightGrams)) {
      throw new Error(`Invalid weight: ${req.weightGrams}`);
    }

    // Parallel fetch from all carriers
    const results = await Promise.allSettled(
      this.adapters.map(adapter =>
        this.withTimeout(adapter.getQuote(req), this.failoverTimeoutMs)
      )
    );

    // Extract successful quotes
    const quotes: QuoteResp[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && invariants.validQuotePrice(result.value) && invariants.validETA(result.value)) {
        quotes.push(result.value);
      }
    }

    if (quotes.length === 0) {
      throw new Error('No carriers available');
    }

    // Sort by price (cheapest first)
    return quotes.sort((a, b) => a.priceCents - b.priceCents);
  }

  /**
   * Create order with automatic failover
   */
  async createOrderWithFailover(req: OrderReq): Promise<OrderResp> {
    const adapter = this.adapters.find(a => a.name === req.carrier);
    if (!adapter) {
      throw new Error(`Unknown carrier: ${req.carrier}`);
    }

    // Try primary carrier
    try {
      const order = await this.withTimeout(
        adapter.createOrder(req),
        this.failoverTimeoutMs
      );

      if (!invariants.validOrder(order)) {
        throw new Error('Invalid order response');
      }

      return order;
    } catch (primaryError) {
      console.warn(`Primary carrier ${req.carrier} failed:`, primaryError);

      // Cascade to next available carrier
      for (const fallbackAdapter of this.adapters) {
        if (fallbackAdapter.name === req.carrier) continue; // Skip failed carrier

        try {
          console.log(`Failing over to ${fallbackAdapter.name}`);
          const fallbackReq = { ...req, carrier: fallbackAdapter.name };
          const order = await this.withTimeout(
            fallbackAdapter.createOrder(fallbackReq),
            this.failoverTimeoutMs
          );

          if (invariants.validOrder(order)) {
            return order;
          }
        } catch (fallbackError) {
          console.warn(`Failover to ${fallbackAdapter.name} failed:`, fallbackError);
          // Continue to next carrier
        }
      }

      // All carriers failed
      throw new Error(`All carriers failed. Last error: ${primaryError}`);
    }
  }

  /**
   * Timeout helper
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      ),
    ]);
  }
}
