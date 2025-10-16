## Example Usage

```ts
const accountId = 'account_id2';

const body: AdjustLoyaltyPointsRequest = {
  idempotencyKey: 'bc29a517-3dc9-450e-aa76-fae39ee849d1',
  adjustPoints: {
    points: 10,
    reason: 'Complimentary points',
  },
};

try {
  const { result, ...httpResponse } = await loyaltyApi.adjustLoyaltyPoints(
  accountId,
  body
);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Loyalty Events

Searches for loyalty events.

A Square loyalty program maintains a ledger of events that occur during the lifetime of a
buyer's loyalty account. Each change in the point balance
(for example, points earned, points redeemed, and points expired) is
recorded in the ledger. Using this endpoint, you can search the ledger for events.

Search results are sorted by `created_at` in descending order.

```ts
async searchLoyaltyEvents(
  body: SearchLoyaltyEventsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchLoyaltyEventsResponse>>
```
