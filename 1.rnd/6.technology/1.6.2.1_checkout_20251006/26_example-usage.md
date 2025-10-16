## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await checkoutApi.deletePaymentLink(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Payment Link

Retrieves a payment link.

```ts
async retrievePaymentLink(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrievePaymentLinkResponse>>
```
