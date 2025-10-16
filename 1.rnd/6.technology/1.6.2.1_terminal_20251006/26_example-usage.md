## Example Usage

```ts
const checkoutId = 'checkout_id8';

try {
  const { result, ...httpResponse } = await terminalApi.getTerminalCheckout(checkoutId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Cancel Terminal Checkout

Cancels a Terminal checkout request if the status of the request permits it.

```ts
async cancelTerminalCheckout(
  checkoutId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CancelTerminalCheckoutResponse>>
```
