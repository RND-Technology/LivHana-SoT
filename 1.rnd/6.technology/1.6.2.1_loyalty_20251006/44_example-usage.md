## Example Usage

```ts
const body: CreateLoyaltyRewardRequest = {
  reward: {
    loyaltyAccountId: '5adcb100-07f1-4ee7-b8c6-6bb9ebc474bd',
    rewardTierId: 'e1b39225-9da5-43d1-a5db-782cdd8ad94f',
    orderId: 'RFZfrdtm3mhO1oGzf5Cx7fEMsmGZY',
  },
  idempotencyKey: '18c2e5ea-a620-4b1f-ad60-7b167285e451',
};

try {
  const { result, ...httpResponse } = await loyaltyApi.createLoyaltyReward(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Loyalty Rewards

Searches for loyalty rewards. This endpoint accepts a request with no query filters and returns results for all loyalty accounts.
If you include a `query` object, `loyalty_account_id` is required and `status` is  optional.

If you know a reward ID, use the
[RetrieveLoyaltyReward](../../doc/api/loyalty.md#retrieve-loyalty-reward) endpoint.

Search results are sorted by `updated_at` in descending order.

```ts
async searchLoyaltyRewards(
  body: SearchLoyaltyRewardsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchLoyaltyRewardsResponse>>
```
