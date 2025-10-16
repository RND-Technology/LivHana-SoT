## Example Usage

```ts
const promotionId = 'promotion_id0';

const programId = 'program_id0';

try {
  const { result, ...httpResponse } = await loyaltyApi.cancelLoyaltyPromotion(
  promotionId,
  programId
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

# Create Loyalty Reward

Creates a loyalty reward. In the process, the endpoint does following:

* Uses the `reward_tier_id` in the request to determine the number of points
  to lock for this reward.
* If the request includes `order_id`, it adds the reward and related discount to the order.

After a reward is created, the points are locked and
not available for the buyer to redeem another reward.

```ts
async createLoyaltyReward(
  body: CreateLoyaltyRewardRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateLoyaltyRewardResponse>>
```
