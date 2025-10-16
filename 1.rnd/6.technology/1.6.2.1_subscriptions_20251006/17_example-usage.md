## Example Usage

```ts
const subscriptionId = 'subscription_id0';

const body: UpdateSubscriptionRequest = {
  subscription: {
    canceledDate: 'canceled_date6',
    cardId: '{NEW CARD ID}',
  },
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.updateSubscription(
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

# Delete Subscription Action

Deletes a scheduled action for a subscription.

```ts
async deleteSubscriptionAction(
  subscriptionId: string,
  actionId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteSubscriptionActionResponse>>
```
