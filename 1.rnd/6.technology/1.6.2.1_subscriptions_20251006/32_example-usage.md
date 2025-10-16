## Example Usage

```ts
const subscriptionId = 'subscription_id0';

const body: PauseSubscriptionRequest = {
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.pauseSubscription(
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

# Resume Subscription

Schedules a `RESUME` action to resume a paused or a deactivated subscription.

```ts
async resumeSubscription(
  subscriptionId: string,
  body: ResumeSubscriptionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ResumeSubscriptionResponse>>
```
