## Example Usage

```ts
const body: SearchLoyaltyRewardsRequest = {
  query: {
    loyaltyAccountId: '5adcb100-07f1-4ee7-b8c6-6bb9ebc474bd',
  },
  limit: 10,
};

try {
  const { result, ...httpResponse } = await loyaltyApi.searchLoyaltyRewards(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Loyalty Reward

Deletes a loyalty reward by doing the following:

* Returns the loyalty points back to the loyalty account.
* If an order ID was specified when the reward was created
  (see [CreateLoyaltyReward](../../doc/api/loyalty.md#create-loyalty-reward)),
  it updates the order by removing the reward and related
  discounts.

You cannot delete a reward that has reached the terminal state (REDEEMED).

```ts
async deleteLoyaltyReward(
  rewardId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteLoyaltyRewardResponse>>
```
