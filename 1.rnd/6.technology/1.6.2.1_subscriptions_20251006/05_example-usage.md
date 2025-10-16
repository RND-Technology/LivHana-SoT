## Example Usage

```ts
const body: CreateSubscriptionRequest = {
  locationId: 'S8GWD5R9QB376',
  customerId: 'CHFGVKYY8RSV93M5KCYTG4PN0G',
  idempotencyKey: '8193148c-9586-11e6-99f9-28cfe92138cf',
  planVariationId: '6JHXF3B2CW3YKHDV4XEM674H',
  startDate: '2023-06-20',
  cardId: 'ccof:qy5x8hHGYsgLrp4Q4GB',
  timezone: 'America/Los_Angeles',
  source: {
    name: 'My Application',
  },
  phases: [
    {
      ordinal: BigInt(0),
      orderTemplateId: 'U2NaowWxzXwpsZU697x7ZHOAnCNZY',
    }
  ],
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.createSubscription(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Swap Plan

Schedules a plan variation change for all active subscriptions under a given plan
variation. For more information, see [Swap Subscription Plan Variations](https://developer.squareup.com/docs/subscriptions-api/swap-plan-variations).

```ts
async bulkSwapPlan(
  body: BulkSwapPlanRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkSwapPlanResponse>>
```
