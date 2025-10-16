## Example Usage

```ts
const rewardId = 'reward_id4';

const body: RedeemLoyaltyRewardRequest = {
  idempotencyKey: '98adc7f7-6963-473b-b29c-f3c9cdd7d994',
  locationId: 'P034NEENMD09F',
};

try {
  const { result, ...httpResponse } = await loyaltyApi.redeemLoyaltyReward(
  rewardId,
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
