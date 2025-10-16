## Example Usage

```ts
const subscriptionId = 'subscription_id0';

try {
  const { result, ...httpResponse } = await subscriptionsApi.retrieveSubscription(subscriptionId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Subscription

Updates a subscription by modifying or clearing `subscription` field values.
To clear a field, set its value to `null`.

```ts
async updateSubscription(
  subscriptionId: string,
  body: UpdateSubscriptionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateSubscriptionResponse>>
```
