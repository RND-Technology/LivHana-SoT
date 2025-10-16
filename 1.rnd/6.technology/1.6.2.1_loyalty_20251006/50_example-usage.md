## Example Usage

```ts
const rewardId = 'reward_id4';

try {
  const { result, ...httpResponse } = await loyaltyApi.deleteLoyaltyReward(rewardId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Loyalty Reward

Retrieves a loyalty reward.

```ts
async retrieveLoyaltyReward(
  rewardId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveLoyaltyRewardResponse>>
```
