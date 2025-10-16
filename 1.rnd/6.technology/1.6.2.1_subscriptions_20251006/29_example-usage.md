## Example Usage

```ts
const subscriptionId = 'subscription_id0';

try {
  const { result, ...httpResponse } = await subscriptionsApi.listSubscriptionEvents(subscriptionId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Pause Subscription

Schedules a `PAUSE` action to pause an active subscription.

```ts
async pauseSubscription(
  subscriptionId: string,
  body: PauseSubscriptionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<PauseSubscriptionResponse>>
```
