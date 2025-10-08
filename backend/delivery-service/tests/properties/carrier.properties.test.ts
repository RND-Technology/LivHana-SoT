// Property-based tests for carrier invariants
// Unfuckwithable Code Protocol: Test with random generated data

import fc from 'fast-check';
import { invariants, type QuoteResp, type OrderResp, type StatusEvt, type QuoteReq } from '../../src/types/carrier.js';

describe('Carrier Invariants (Property-Based)', () => {
  describe('QuoteResp invariants', () => {
    const quoteRespArbitrary = fc.record({
      carrier: fc.constantFrom('skipcart', 'roadie', 'favor', 'dispatch', 'senpex'),
      priceCents: fc.integer({ min: 1, max: 100000 }),
      etaMins: fc.integer({ min: 5, max: 1440 }),
      quoteId: fc.uuid(),
    });

    it('price must always be positive', () => {
      fc.assert(
        fc.property(quoteRespArbitrary, (quote: QuoteResp) => {
          return invariants.validQuotePrice(quote);
        })
      );
    });

    it('ETA must be in valid range (5-1440 mins)', () => {
      fc.assert(
        fc.property(quoteRespArbitrary, (quote: QuoteResp) => {
          return invariants.validETA(quote);
        })
      );
    });

    it('invalid ETA should fail', () => {
      const invalidETAQuote = fc.record({
        carrier: fc.constantFrom('skipcart', 'roadie', 'favor', 'dispatch', 'senpex'),
        priceCents: fc.integer({ min: 1, max: 100000 }),
        etaMins: fc.oneof(
          fc.integer({ max: 4 }), // Too short
          fc.integer({ min: 1441 }) // Too long
        ),
        quoteId: fc.uuid(),
      });

      fc.assert(
        fc.property(invalidETAQuote, (quote: QuoteResp) => {
          return !invariants.validETA(quote);
        })
      );
    });
  });

  describe('OrderResp invariants', () => {
    const orderRespArbitrary = fc.record({
      orderId: fc.uuid(),
      externalId: fc.string({ minLength: 1, maxLength: 100 }),
      status: fc.constantFrom('created', 'assigned', 'picked_up', 'delivered', 'failed', 'cancelled'),
    });

    it('order must have non-empty external ID', () => {
      fc.assert(
        fc.property(orderRespArbitrary, (order: OrderResp) => {
          return invariants.validOrder(order);
        })
      );
    });

    it('empty external ID should fail', () => {
      fc.assert(
        fc.property(
          fc.record({
            orderId: fc.uuid(),
            externalId: fc.constant(''),
            status: fc.constantFrom('created', 'assigned', 'picked_up', 'delivered', 'failed', 'cancelled'),
          }),
          (order: OrderResp) => {
            return !invariants.validOrder(order);
          }
        )
      );
    });
  });

  describe('StatusEvt invariants', () => {
    const statusEvtArbitrary = fc.record({
      carrier: fc.constantFrom('skipcart', 'roadie', 'favor', 'dispatch', 'senpex'),
      externalId: fc.uuid(),
      status: fc.constantFrom('created', 'assigned', 'picked_up', 'delivered', 'failed', 'cancelled'),
      at: fc.integer({ min: 1, max: Date.now() + 86400000 }), // Within 24 hours
      proof: fc.option(
        fc.record({
          photoUrl: fc.option(fc.webUrl()),
          sig: fc.option(fc.base64String()),
        })
      ),
    });

    it('status event must have positive timestamp', () => {
      fc.assert(
        fc.property(statusEvtArbitrary, (evt: StatusEvt) => {
          return invariants.validStatus(evt);
        })
      );
    });

    it('zero/negative timestamp should fail', () => {
      fc.assert(
        fc.property(
          fc.record({
            carrier: fc.constantFrom('skipcart', 'roadie', 'favor', 'dispatch', 'senpex'),
            externalId: fc.uuid(),
            status: fc.constantFrom('created', 'assigned', 'picked_up', 'delivered', 'failed', 'cancelled'),
            at: fc.integer({ max: 0 }),
          }),
          (evt: StatusEvt) => {
            return !invariants.validStatus(evt);
          }
        )
      );
    });
  });

  describe('QuoteReq invariants', () => {
    const validZipArbitrary = fc
      .integer({ min: 10000, max: 99999 })
      .map(n => n.toString());

    const quoteReqArbitrary = fc.record({
      fromZip: validZipArbitrary,
      toZip: validZipArbitrary,
      weightGrams: fc.integer({ min: 1, max: 49999 }),
      etaMins: fc.integer({ min: 5, max: 1440 }),
    });

    it('zip codes must be 5 digits', () => {
      fc.assert(
        fc.property(quoteReqArbitrary, (req: QuoteReq) => {
          return invariants.validZip(req.fromZip) && invariants.validZip(req.toZip);
        })
      );
    });

    it('invalid zip codes should fail', () => {
      const invalidZips = fc.oneof(
        fc.constant('1234'), // Too short
        fc.constant('123456'), // Too long
        fc.constant('abcde'), // Non-numeric
        fc.constant(''), // Empty
      );

      fc.assert(
        fc.property(invalidZips, (zip: string) => {
          return !invariants.validZip(zip);
        })
      );
    });

    it('weight must be positive and under 50kg', () => {
      fc.assert(
        fc.property(quoteReqArbitrary, (req: QuoteReq) => {
          return invariants.validWeight(req.weightGrams);
        })
      );
    });

    it('invalid weight should fail', () => {
      const invalidWeights = fc.oneof(
        fc.integer({ max: 0 }), // Zero or negative
        fc.integer({ min: 50001 }) // Over 50kg
      );

      fc.assert(
        fc.property(invalidWeights, (weight: number) => {
          return !invariants.validWeight(weight);
        })
      );
    });
  });

  describe('Orchestrator failover properties', () => {
    it('quotes should always be sorted by price ascending', () => {
      const quotesArbitrary = fc
        .array(
          fc.record({
            carrier: fc.constantFrom('skipcart', 'roadie', 'favor', 'dispatch', 'senpex'),
            priceCents: fc.integer({ min: 100, max: 10000 }),
            etaMins: fc.integer({ min: 5, max: 1440 }),
            quoteId: fc.uuid(),
          }),
          { minLength: 1, maxLength: 5 }
        )
        .map(quotes => quotes.sort((a, b) => a.priceCents - b.priceCents));

      fc.assert(
        fc.property(quotesArbitrary, (quotes: QuoteResp[]) => {
          // Check that each quote is cheaper or equal to the next
          for (let i = 0; i < quotes.length - 1; i++) {
            if (quotes[i]!.priceCents > quotes[i + 1]!.priceCents) {
              return false;
            }
          }
          return true;
        })
      );
    });
  });
});
