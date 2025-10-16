## Example Usage

```ts
const subscriptionId = 'subscription_id0';

const body: ChangeBillingAnchorDateRequest = {
  monthlyBillingAnchorDate: 1,
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.changeBillingAnchorDate(
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

# Cancel Subscription

Schedules a `CANCEL` action to cancel an active subscription. This
sets the `canceled_date` field to the end of the active billing period. After this date,
the subscription status changes from ACTIVE to CANCELED.

```ts
async cancelSubscription(
  subscriptionId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CancelSubscriptionResponse>>
```
