## Example Usage

```ts
const actionId = 'action_id6';

try {
  const { result, ...httpResponse } = await terminalApi.dismissTerminalAction(actionId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Terminal Checkout

Creates a Terminal checkout request and sends it to the specified device to take a payment
for the requested amount.

```ts
async createTerminalCheckout(
  body: CreateTerminalCheckoutRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateTerminalCheckoutResponse>>
```
