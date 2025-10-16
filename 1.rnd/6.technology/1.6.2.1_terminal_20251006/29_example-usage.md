## Example Usage

```ts
const checkoutId = 'checkout_id8';

try {
  const { result, ...httpResponse } = await terminalApi.cancelTerminalCheckout(checkoutId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Dismiss Terminal Checkout

Dismisses a Terminal checkout request if the status and type of the request permits it.

```ts
async dismissTerminalCheckout(
  checkoutId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DismissTerminalCheckoutResponse>>
```
