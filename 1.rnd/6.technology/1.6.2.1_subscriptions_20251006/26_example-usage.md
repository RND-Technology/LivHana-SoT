## Example Usage

```ts
const subscriptionId = 'subscription_id0';

try {
  const { result, ...httpResponse } = await subscriptionsApi.cancelSubscription(subscriptionId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Subscription Events

Lists all [events](https://developer.squareup.com/docs/subscriptions-api/actions-events) for a specific subscription.

```ts
async listSubscriptionEvents(
  subscriptionId: string,
  cursor?: string,
  limit?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListSubscriptionEventsResponse>>
```
