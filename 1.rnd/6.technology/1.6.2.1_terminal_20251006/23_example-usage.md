## Example Usage

```ts
const body: SearchTerminalCheckoutsRequest = {
  query: {
    filter: {
      status: 'COMPLETED',
    },
  },
  limit: 2,
};

try {
  const { result, ...httpResponse } = await terminalApi.searchTerminalCheckouts(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Terminal Checkout

Retrieves a Terminal checkout request by `checkout_id`. Terminal checkout requests are available for 30 days.

```ts
async getTerminalCheckout(
  checkoutId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetTerminalCheckoutResponse>>
```
