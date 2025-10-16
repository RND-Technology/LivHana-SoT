## Example Usage

```ts
const checkoutId = 'checkout_id8';

try {
  const { result, ...httpResponse } = await terminalApi.dismissTerminalCheckout(checkoutId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Terminal Refund

Creates a request to refund an Interac payment completed on a Square Terminal. Refunds for Interac payments on a Square Terminal are supported only for Interac debit cards in Canada. Other refunds for Terminal payments should use the Refunds API. For more information, see [Refunds API](../../doc/api/refunds.md).

```ts
async createTerminalRefund(
  body: CreateTerminalRefundRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateTerminalRefundResponse>>
```
