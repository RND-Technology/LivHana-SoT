## Example Usage

```ts
const subscriptionId = 'subscription_id0';

const actionId = 'action_id6';

try {
  const { result, ...httpResponse } = await subscriptionsApi.deleteSubscriptionAction(
  subscriptionId,
  actionId
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

# Change Billing Anchor Date

Changes the [billing anchor date](https://developer.squareup.com/docs/subscriptions-api/subscription-billing#billing-dates)
for a subscription.

```ts
async changeBillingAnchorDate(
  subscriptionId: string,
  body: ChangeBillingAnchorDateRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ChangeBillingAnchorDateResponse>>
```
