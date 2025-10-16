## Example Usage

```ts
try {
  const { result, ...httpResponse } = await checkoutApi.listPaymentLinks();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Payment Link

Creates a Square-hosted checkout page. Applications can share the resulting payment link with their buyer to pay for goods and services.

```ts
async createPaymentLink(
  body: CreatePaymentLinkRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreatePaymentLinkResponse>>
```
