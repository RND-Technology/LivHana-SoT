## Example Usage

```ts
const accountId = 'account_id2';

const body: AccumulateLoyaltyPointsRequest = {
  accumulatePoints: {
    orderId: 'RFZfrdtm3mhO1oGzf5Cx7fEMsmGZY',
  },
  idempotencyKey: '58b90739-c3e8-4b11-85f7-e636d48d72cb',
  locationId: 'P034NEENMD09F',
};

try {
  const { result, ...httpResponse } = await loyaltyApi.accumulateLoyaltyPoints(
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

# Adjust Loyalty Points

Adds points to or subtracts points from a buyer's account.

Use this endpoint only when you need to manually adjust points. Otherwise, in your application flow, you call
[AccumulateLoyaltyPoints](../../doc/api/loyalty.md#accumulate-loyalty-points)
to add points when a buyer pays for the purchase.

```ts
async adjustLoyaltyPoints(
  accountId: string,
  body: AdjustLoyaltyPointsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<AdjustLoyaltyPointsResponse>>
```
