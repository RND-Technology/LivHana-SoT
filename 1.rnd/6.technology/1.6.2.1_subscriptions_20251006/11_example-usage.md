## Example Usage

```ts
const body: SearchSubscriptionsRequest = {
  query: {
    filter: {
      customerIds: [
        'CHFGVKYY8RSV93M5KCYTG4PN0G'
      ],
      locationIds: [
        'S8GWD5R9QB376'
      ],
      sourceNames: [
        'My App'
      ],
    },
  },
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.searchSubscriptions(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Subscription

Retrieves a specific subscription.

```ts
async retrieveSubscription(
  subscriptionId: string,
  include?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveSubscriptionResponse>>
```
