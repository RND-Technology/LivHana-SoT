## Example Usage

```ts
const subscriptionId = 'subscription_id0';

const body: ResumeSubscriptionRequest = {
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.resumeSubscription(
  subscriptionId,
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

# Swap Plan

Schedules a `SWAP_PLAN` action to swap a subscription plan variation in an existing subscription.
For more information, see [Swap Subscription Plan Variations](https://developer.squareup.com/docs/subscriptions-api/swap-plan-variations).

```ts
async swapPlan(
  subscriptionId: string,
  body: SwapPlanRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SwapPlanResponse>>
```
