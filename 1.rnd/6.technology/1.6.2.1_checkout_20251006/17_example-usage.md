## Example Usage

```ts
const body: UpdateMerchantSettingsRequest = {
  merchantSettings: {
  },
};

try {
  const { result, ...httpResponse } = await checkoutApi.updateMerchantSettings(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Payment Links

Lists all payment links.

```ts
async listPaymentLinks(
  cursor?: string,
  limit?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListPaymentLinksResponse>>
```
