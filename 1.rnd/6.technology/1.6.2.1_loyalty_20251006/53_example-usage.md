## Example Usage

```ts
const rewardId = 'reward_id4';

try {
  const { result, ...httpResponse } = await loyaltyApi.retrieveLoyaltyReward(rewardId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Redeem Loyalty Reward

Redeems a loyalty reward.

The endpoint sets the reward to the `REDEEMED` terminal state.

If you are using your own order processing system (not using the
Orders API), you call this endpoint after the buyer paid for the
purchase.

After the reward reaches the terminal state, it cannot be deleted.
In other words, points used for the reward cannot be returned
to the account.

```ts
async redeemLoyaltyReward(
  rewardId: string,
  body: RedeemLoyaltyRewardRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RedeemLoyaltyRewardResponse>>
```
